"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  action: string;
  priority: number | null;
  isActive: boolean | null;
  timesTriggered: number | null;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/automation/rules");
      if (!response.ok) throw new Error("Failed to fetch rules");

      const data = await response.json();
      setRules(data.rules);
    } catch (error) {
      console.error("Fetch rules error:", error);
      toast.error("Failed to load automation rules");
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/automation/rules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ruleId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update rule");

      toast.success("Rule updated successfully");
      fetchRules();
    } catch (error) {
      console.error("Toggle rule error:", error);
      toast.error("Failed to update rule");
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    try {
      const response = await fetch(`/api/automation/rules?ruleId=${ruleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete rule");

      toast.success("Rule deleted successfully");
      fetchRules();
    } catch (error) {
      console.error("Delete rule error:", error);
      toast.error("Failed to delete rule");
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "auto_send":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "manual_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "skip":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "";
    }
  };

  const formatCondition = (condition: {
    field: string;
    operator: string;
    value: any;
  }) => {
    const operatorMap: Record<string, string> = {
      equals: "=",
      not_equals: "≠",
      contains: "contains",
      not_contains: "doesn't contain",
      in: "is one of",
      not_in: "is not one of",
      greater_than: ">",
      less_than: "<",
      greater_than_or_equal: "≥",
      less_than_or_equal: "≤",
    };

    const value = Array.isArray(condition.value)
      ? condition.value.join(", ")
      : condition.value;

    return `${condition.field} ${operatorMap[condition.operator] || condition.operator} ${value}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading automation rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Automation Rules
          </h1>
          <p className="text-muted-foreground mt-2">
            Define rules to automatically approve or review emails
          </p>
        </div>
        <Button>Create Rule</Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            How Automation Works
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Automation rules evaluate leads when emails are generated. Rules are
            checked in priority order (highest first). When a lead matches a
            rule, the corresponding action is taken.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <div>
            <strong>Auto-send:</strong> Email is automatically approved and can
            be sent
          </div>
          <div>
            <strong>Manual review:</strong> Email requires your review before
            sending
          </div>
          <div>
            <strong>Skip:</strong> Email generation is skipped for this lead
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      {rules.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No automation rules</CardTitle>
            <CardDescription>
              Create your first rule to start automating your email workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Create Rule</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{rule.name}</CardTitle>
                      <Badge
                        variant={rule.isActive ? "default" : "secondary"}
                        className={rule.isActive ? "" : "opacity-60"}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge
                        className={getActionColor(rule.action)}
                        variant="outline"
                      >
                        {rule.action?.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">
                        Priority: {rule.priority || 0}
                      </Badge>
                    </div>
                    {rule.description && (
                      <CardDescription>{rule.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Conditions */}
                <div>
                  <div className="text-sm font-medium mb-2">Conditions:</div>
                  <div className="space-y-1">
                    {rule.conditions && rule.conditions.length > 0 ? (
                      rule.conditions.map((condition, index) => (
                        <div
                          key={index}
                          className="text-sm bg-muted p-2 rounded"
                        >
                          {formatCondition(condition)}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No conditions defined
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {rule.timesTriggered !== null && (
                  <div className="text-sm text-muted-foreground">
                    Triggered {rule.timesTriggered} times
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRule(rule.id, rule.isActive || false)}
                  >
                    {rule.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
<<<<<<< HEAD
=======




>>>>>>> 262fcb9 (somewhat working)
