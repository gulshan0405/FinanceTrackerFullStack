"use client";
import { updateBudget as updateBudgetAction } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/useFetch";
import { Check, Pencil, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const BudgetProgress = ({ initalBudget, currentExpenses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initalBudget?.amount?.toString() || ""
  );

  const percentUsed = initalBudget
    ? (currentExpenses / initalBudget.amount) * 100
    : 0;

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updateBudgetResult,
    error,
  } = useFetch(updateBudgetAction);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  useEffect(() => {
  if (updateBudgetResult?.success) {
    setIsEditing(false);
    toast.success("Budget updated successfully");
  }
}, [updateBudgetResult]);


  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  const handleCancel = () => {
    setNewBudget(initalBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

   const progressColor =
  percentUsed >= 90
    ? "[&>div]:bg-red-500"
    : percentUsed >= 75
    ? "[&>div]:bg-yellow-500"
    : "[&>div]:bg-green-500";

// Then use: <Progress value={percentUsed} className={progressColor} />
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle>Monthly Bidget (Default Account)</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="size-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="size-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initalBudget
                    ? `$${currentExpenses.toFixed(
                        2
                      )}of $${initalBudget.amount.toFixed(2)}spent`
                    : "No budget set"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="size-6"
                >
                  <Pencil className="size-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
    <CardContent>
  {initalBudget && (
    <div className="space-y-2">
      <Progress 
        value={percentUsed} 
        className={progressColor} // Since progressColor already has the prefix
      />
      <p className="text-xs text-muted-foreground text-right">
        {percentUsed.toFixed(1)}% used
      </p>
      {percentUsed >= 100 && (
        <p className="text-[10px] text-red-500 font-medium text-right">
          Budget exceeded!
        </p>
      )}
    </div>
  )}
</CardContent>
    </Card>
  );
};

export default BudgetProgress;
