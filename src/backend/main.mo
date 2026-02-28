import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Transaction = {
    id : Nat;
    date : Text;
    transactionType : Text;
    category : Text;
    amount : Nat;
    paymentStatus : Text;
    notes : Text;
    createdAt : Int;
  };

  module Transaction {
    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };

  let transactions = Map.empty<Principal, Map.Map<Nat, Transaction>>();
  var nextTransactionId = 0;

  public shared ({ caller }) func addTransaction(date : Text, transactionType : Text, category : Text, amount : Nat, paymentStatus : Text, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    let id = nextTransactionId;
    nextTransactionId += 1;
    let newTransaction : Transaction = {
      id;
      date;
      transactionType;
      category;
      amount;
      paymentStatus;
      notes;
      createdAt = Time.now();
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { Map.empty<Nat, Transaction>() };
      case (?t) { t };
    };

    userTransactions.add(id, newTransaction);
    transactions.add(caller, userTransactions);
    id;
  };

  public query ({ caller }) func getMyTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    switch (transactions.get(caller)) {
      case (null) { [] };
      case (?userTransactions) { userTransactions.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func updateTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transactions");
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { Runtime.trap("Transaction does not exist") };
      case (?t) { t };
    };

    if (not userTransactions.containsKey(transaction.id)) {
      Runtime.trap("Transaction does not exist");
    };

    userTransactions.add(transaction.id, transaction);
    transactions.add(caller, userTransactions);
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { Runtime.trap("Transaction does not exist") };
      case (?t) { t };
    };

    userTransactions.remove(id);
    transactions.add(caller, userTransactions);
  };

  public query ({ caller }) func getDailySummary(date : Text) : async (Nat, Nat, Int) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view summaries");
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { return (0, 0, 0) };
      case (?t) { t };
    };

    var totalSales = 0;
    var totalExpenses = 0;

    for (transaction in userTransactions.values()) {
      if (transaction.date == date) {
        if (transaction.transactionType == "Sale") {
          totalSales += transaction.amount;
        } else if (transaction.transactionType == "Expense") {
          totalExpenses += transaction.amount;
        };
      };
    };

    let netProfit = totalSales.toInt() - totalExpenses.toInt();
    (totalSales, totalExpenses, netProfit);
  };

  public query ({ caller }) func getMonthlySummary(year : Text, month : Text) : async (Nat, Nat, Int) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view summaries");
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { return (0, 0, 0) };
      case (?t) { t };
    };

    var totalSales = 0;
    var totalExpenses = 0;

    for (transaction in userTransactions.values()) {
      if (transaction.date.startsWith(#text(year # "-" # month))) {
        if (transaction.transactionType == "Sale") {
          totalSales += transaction.amount;
        } else if (transaction.transactionType == "Expense") {
          totalExpenses += transaction.amount;
        };
      };
    };

    let netProfit = totalSales.toInt() - totalExpenses.toInt();
    (totalSales, totalExpenses, netProfit);
  };

  public query ({ caller }) func getPendingTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { return [] };
      case (?t) { t };
    };

    userTransactions.values().toArray().filter(func(transaction) { transaction.paymentStatus == "Pending" }).sort();
  };

  public query ({ caller }) func getExpenseCategories() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense categories");
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { return [] };
      case (?t) { t };
    };

    let categoryTotals = Map.empty<Text, Nat>();

    for (transaction in userTransactions.values()) {
      if (transaction.transactionType == "Expense") {
        let currentTotal = switch (categoryTotals.get(transaction.category)) {
          case (null) { 0 };
          case (?total) { total };
        };
        categoryTotals.add(transaction.category, currentTotal + transaction.amount);
      };
    };

    categoryTotals.toArray();
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    switch (transactions.get(caller)) {
      case (null) { [] };
      case (?userTransactions) { userTransactions.values().toArray().sort() };
    };
  };
};
