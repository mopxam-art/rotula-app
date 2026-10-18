"use client";

import React from "react";
import Link from "next/link";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { SavingsCircles } from "@/components/dashboard/SavingsCircles";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { useWallet } from "@/hooks/useWallet";
import { useGroups } from "@/hooks/useGroups";
import { usePayments } from "@/hooks/usePayments";

export default function Dashboard() {
  const {
    data: walletData,
    isLoading: isWalletLoading,
    error: walletError,
  } = useWallet();
  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = useGroups();
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    error: paymentsError,
  } = usePayments();

  const groups = groupsData || [];
  const transactions = paymentsData || [];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 
        Using CSS Grid to gracefully collapse from multi-column layout 
        into a single column on smaller screens. 
        Actually, a single column of full-width rows works perfectly for this layout,
        as defined in the Figma.
      */}
      <div className="grid grid-cols-1 gap-8 md:gap-12">
        {/* Balance Card Section */}
        <section>
          {walletError ? (
            <div
              role="alert"
              aria-live="polite"
              className="w-full h-36 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-600 font-medium shadow-sm"
            >
              {walletError.message || "Error loading wallet data"}
            </div>
          ) : (
            <BalanceCard
              balance={walletData?.balance}
              currency={walletData?.currency}
              trendPercentage={walletData?.trendPercentage}
              isLoading={isWalletLoading}
            />
          )}
        </section>

        {/* Savings Circles Section */}
        <section>
          {groupsError ? (
            <div
              role="alert"
              aria-live="polite"
              className="w-full h-64 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-600 font-medium shadow-sm"
            >
              {groupsError.message || "Error loading savings groups"}
            </div>
          ) : (
            <SavingsCircles groups={groups} isLoading={isGroupsLoading} />
          )}
        </section>

        {/* Recent Activity Section */}
        <section>
          {paymentsError ? (
            <div
              role="alert"
              aria-live="polite"
              className="w-full min-h-96 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-600 font-medium shadow-sm"
            >
              {paymentsError.message || "Error loading transactions"}
            </div>
          ) : (
            <TransactionList
              transactions={transactions}
              isLoading={isPaymentsLoading}
            />
          )}
        </section>
      </div>
    </div>
  );
}
