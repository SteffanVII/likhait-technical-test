import React, { useState, useEffect, useMemo } from "react";
import { useFetchExpenses } from "../services/api";
import YearNavigation from "../components/YearNavigation";
import { MonthNavigation } from "../components/MonthNavigation";
import CategoryBreakdown from "../components/CategoryBreakdown";
import { CalendarExpenseTable } from "../components/CalendarExpenseTable";
import { ExpenseForm } from "../components/ExpenseForm";
import { Modal, Button } from "../vibes";
import { COLORS } from "../constants/colors";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";

const HistoryPage: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isCategoryListModalOpen, setIsCategoryListModalOpen] = useState(false);

    // Get year and month from URL params, default to current date if not provided
    const getInitialYearMonth = () => {
        const params = new URLSearchParams(window.location.search);
        const currentDate = new Date();
        const yearParam = params.get("year");
        const monthParam = params.get("month");

        return {
            year: yearParam ? parseInt(yearParam) : currentDate.getFullYear(),
            month: monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1,
        };
    };

    const initial = getInitialYearMonth();
    const [selectedYear, setSelectedYear] = useState(initial.year);
    const [selectedMonth, setSelectedMonth] = useState(initial.month);

    const {
        data: expensesData,
        isLoading: isLoadingExpenses
    } = useFetchExpenses(selectedYear, selectedMonth)

    // Update URL when year or month changes
    const updateURL = (year: number, month: number) => {
        const params = new URLSearchParams();
        params.set("year", year.toString());
        params.set("month", month.toString());
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newURL);
    };

    // Initialize URL params if not present
    useEffect(() => {
        updateURL(selectedYear, selectedMonth);
    }, []);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        updateURL(year, selectedMonth);
    };

    const handleMonthChange = (month: number) => {
        setSelectedMonth(month);
        updateURL(selectedYear, month);
    };

    // Calculate category breakdown
    const categoryData = useMemo(() => {
        return (expensesData || []).reduce(
            (acc, expense) => {
                const category = expense.category || "Uncategorized";
                if (!acc[category.name]) {
                    acc[category.name] = { category, amount: 0, count: 0 };
                }
                acc[category.name].amount += Number(expense.amount);
                acc[category.name].count += 1;
                return acc;
            },
            {} as Record<string, { category: { name: string, emoji: string | null }; amount: number; count: number }>,
        )
    }, [expensesData])

    const categories = useMemo(() => {
        return Object.values(categoryData).sort(
            (a, b) => b.amount - a.amount,
        );
    }, [categoryData])

    const total = useMemo(() => {
        return categories.reduce((sum, cat) => sum + cat.amount, 0)
    }, [categories])

    const totalCount = useMemo(() => {
        return categories.reduce((sum, cat) => sum + cat.count, 0)
    }, [categories])

    const pageStyle: React.CSSProperties = {
        padding: "48px 64px",
        minHeight: "100vh",
        background: COLORS.secondary.s01,
    };

    const headerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "24px",
        justifyContent: "space-between",
    };

    const leftHeaderStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "24px",
    };

    const titleStyle: React.CSSProperties = {
        fontSize: "40px",
        fontWeight: 700,
        color: COLORS.secondary.s10,
        margin: 0,
        flexShrink: 0,
    };

    const loadingStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px",
        fontSize: "18px",
        color: COLORS.secondary.s08,
    };

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <div style={leftHeaderStyle}>
                    <h1 style={titleStyle}>Expense History</h1>
                    <YearNavigation
                        currentYear={selectedYear}
                        onYearChange={handleYearChange}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem" }} >
                    <Button variant="secondary" onClick={() => setIsCategoryListModalOpen(true)}>
                        Category List
                    </Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        Add Expense
                    </Button>
                </div>
            </div>

            <MonthNavigation
                currentMonth={selectedMonth}
                currentYear={selectedYear}
                onMonthChange={handleMonthChange}
            />

            <div>
                {isLoadingExpenses ? (
                    <div style={loadingStyle}>Loading...</div>
                ) : (
                    <>
                        <CategoryBreakdown
                            categories={categories}
                            total={total}
                            totalCount={totalCount}
                        />
                        <div style={{ marginTop: "32px" }}>
                            <CalendarExpenseTable
                                expenses={expensesData || []}
                            // onExpenseUpdated={fetchExpenses}
                            />
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Expense"
            >
                <ExpenseForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isCategoryListModalOpen}
                onClose={() => setIsCategoryListModalOpen(false)}
                title="Category List"
            >
                <CategoryList/>
            </Modal>

            <Modal
                isOpen={isAddCategoryModalOpen}
                onClose={() => setIsAddCategoryModalOpen(false)}
                title="Add New Category"
            >
                <CategoryForm
                    onSuccess={() => setIsAddCategoryModalOpen(false)}
                    onCancel={() => setIsAddCategoryModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default HistoryPage;
