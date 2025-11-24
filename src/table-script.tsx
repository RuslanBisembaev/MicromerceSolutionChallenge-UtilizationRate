import { MaterialReactTable, type MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { useMemo } from "react";
import sourceData from "./source-data.json";
import type { SourceDataType, TableDataType } from "./types";

// --- Constants & Configuration ---

const CURRENT_MONTH = "2024-07";

const UTILIZATION_THRESHOLDS = {
    HIGH: 80,
    MEDIUM: 50,
} as const;

const COLORS = {
    utilization: {
        high: "#2e7d32",
        medium: "#ed6c02",
        low: "#d32f2f",
    },
    earnings: {
        positive: "#2e7d32",
        negative: "#d32f2f",
    },
    neutral: "#666",
    primary: "#1976d2",
} as const;

// Helper to sort month columns chronologically
const MONTH_ORDER: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

const Example = () => {
    // 1. Extract available months from data source
    const dynamicMonths = useMemo(() => getAvailableMonths(sourceData as unknown as SourceDataType[]), []);

    // 2. Generate table data based on discovered months
    const tableData = useMemo(() =>
            transformToTableData(sourceData as unknown as SourceDataType[], dynamicMonths),
        [dynamicMonths]);

    // 3. Define columns (Static + Dynamic)
    const columns = useMemo<MRT_ColumnDef<TableDataType>[]>(
        () => {
            const baseColumns: MRT_ColumnDef<TableDataType>[] = [
                {
                    accessorKey: "person",
                    header: "Person",
                    size: 220,
                    minSize: 220,
                    maxSize: 300,
                    Cell: ({ cell }) => (
                        <span style={{ fontWeight: 600, color: COLORS.primary }}>
                            {cell.getValue<string>()}
                        </span>
                    ),
                },
                {
                    accessorKey: "past12Months",
                    header: "Past 12 Months",
                    size: 160,
                    minSize: 160,
                    maxSize: 200,
                    Cell: ({ cell }) => (
                        <span style={{ color: getUtilizationColor(cell.getValue<string>()), fontWeight: 600 }}>
                            {cell.getValue<string>()}
                        </span>
                    ),
                },
                {
                    accessorKey: "y2d",
                    header: "YTD",
                    size: 110,
                    minSize: 110,
                    maxSize: 150,
                    Cell: ({ cell }) => (
                        <span style={{ color: getUtilizationColor(cell.getValue<string>()), fontWeight: 600 }}>
                            {cell.getValue<string>()}
                        </span>
                    ),
                },
            ];

            // Generate dynamic month columns
            const monthColumns: MRT_ColumnDef<TableDataType>[] = dynamicMonths.map(month => ({
                accessorKey: month,
                header: month,
                size: 110,
                minSize: 110,
                maxSize: 150,
                Cell: ({ cell }) => (
                    <span style={{ color: getUtilizationColor(cell.getValue<string>()), fontWeight: 600 }}>
                        {cell.getValue<string>()}
                    </span>
                ),
            }));

            const endColumns: MRT_ColumnDef<TableDataType>[] = [
                {
                    accessorKey: "netEarningsPrevMonth",
                    header: "Net Earnings Prev Month",
                    size: 220,
                    minSize: 220,
                    maxSize: 300,
                    Cell: ({ cell }) => (
                        <span style={{ color: getEarningsColor(cell.getValue<string>()), fontWeight: 600 }}>
                            {cell.getValue<string>()}
                        </span>
                    ),
                },
            ];

            return [...baseColumns, ...monthColumns, ...endColumns];
        },
        [dynamicMonths]
    );

    const table = useMaterialReactTable({
        columns,
        data: tableData,
        enableColumnResizing: true,
        enableSorting: true,
        enablePagination: true,
        enableRowNumbers: true,
        enableDensityToggle: false,
        layoutMode: 'semantic',
        displayColumnDefOptions: {
            'mrt-row-numbers': {
                size: 60,
            },
        },
        muiTableProps: {
            sx: {
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                tableLayout: 'fixed',
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: COLORS.primary,
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
                padding: "16px 8px",
                overflow: 'visible',
                textOverflow: 'clip',
                whiteSpace: "normal",
                lineHeight: "1.3",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                fontSize: "13px",
            },
        },
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.index % 2 === 0 ? "#f5f5f5" : "white",
                "&:hover": {
                    backgroundColor: "#e3f2fd !important",
                },
            },
        }),
        initialState: {
            pagination: { pageSize: 20, pageIndex: 0 },
            density: "comfortable",
        },
    });

    return <MaterialReactTable table={table} />;
};

// --- Helper Functions ---

const formatPercentage = (value: number | null): string => {
    if (value === null || isNaN(value)) return "0%";
    return `${(value * 100).toFixed(0)}%`;
};

const formatCurrency = (value: number | null): string => {
    if (value === null || isNaN(value)) return "0.00 EUR";
    return `${value.toFixed(2)} EUR`;
};

const getUtilizationColor = (percentageString: string): string => {
    const numValue = parseFloat(percentageString);
    if (isNaN(numValue)) return COLORS.neutral;
    if (numValue >= UTILIZATION_THRESHOLDS.HIGH) return COLORS.utilization.high;
    if (numValue >= UTILIZATION_THRESHOLDS.MEDIUM) return COLORS.utilization.medium;
    return COLORS.utilization.low;
};

const getEarningsColor = (currencyString: string): string => {
    const numValue = parseFloat(currencyString.replace(/[^\d.-]/g, ""));
    if (isNaN(numValue)) return COLORS.neutral;
    return numValue >= 0 ? COLORS.earnings.positive : COLORS.earnings.negative;
};

// Extract utilization rate for a specific month from the dataset
const getMonthUtilization = (
    lastThreeMonths: Array<{ month: string; utilisationRate: string }> | undefined,
    monthName: string
): number | null => {
    if (!lastThreeMonths) return null;
    const monthData = lastThreeMonths.find(
        (m) => m.month.toLowerCase() === monthName.toLowerCase()
    );
    return monthData ? parseFloat(monthData.utilisationRate) : null;
};

// Extract all unique months present in the dataset and sort them chronologically
const getAvailableMonths = (data: SourceDataType[]): string[] => {
    const monthsSet = new Set<string>();

    data.forEach(row => {
        const entity = row.employees || row.externals;
        entity?.workforceUtilisation?.lastThreeMonthsIndividually?.forEach(item => {
            if (item.month) monthsSet.add(item.month);
        });
    });

    return Array.from(monthsSet).sort((a, b) => (MONTH_ORDER[a] || 0) - (MONTH_ORDER[b] || 0));
};

// Calculate Net Earnings (Revenue - Costs) for the current target month
const calculateNetEarningsPrevMonth = (entity: any): number | null => {
    const costsByMonth = entity?.costsByMonth?.potentialEarningsByMonth || entity?.costsByMonth?.costsByMonth;
    let costs = 0;

    if (costsByMonth) {
        const currentMonthData = costsByMonth.find((m: any) => m.month === CURRENT_MONTH);
        if (currentMonthData) {
            costs = parseFloat(currentMonthData.costs || "0");
        }
    }

    // Revenue approximation via Q3 earnings (since July is part of Q3)
    const workforce = entity?.workforceUtilisation;
    let revenue = 0;
    if (workforce?.quarterEarnings) {
        const q3 = workforce.quarterEarnings.find((q: any) => q.name === "Q3");
        if (q3) {
            revenue = parseFloat(q3.earnings || "0") / 3;
        }
    }

    return revenue - costs;
};

// Transform raw source data into table row structure
const transformToTableData = (dataRows: SourceDataType[], monthsToMap: string[]): TableDataType[] => {
    return dataRows
        .filter((dataRow) => {
            const entity = dataRow?.employees || dataRow?.externals;
            return entity?.status === "active";
        })
        .map((dataRow) => {
            const entity = dataRow?.employees || dataRow?.externals;
            if (!entity) return null;

            const isExternal = !!dataRow?.externals;
            const workforce = entity.workforceUtilisation;

            // Base data fields
            const rowData: TableDataType = {
                person: `${entity.firstname} ${entity.lastname}${isExternal ? " (External)" : ""}`,
                past12Months: formatPercentage(workforce?.utilisationRateLastTwelveMonths ? parseFloat(workforce.utilisationRateLastTwelveMonths) : null),
                y2d: formatPercentage(workforce?.utilisationRateYearToDate ? parseFloat(workforce.utilisationRateYearToDate) : null),
                netEarningsPrevMonth: formatCurrency(calculateNetEarningsPrevMonth(entity)),
            };

            // Dynamically map monthly utilization data to row object
            monthsToMap.forEach(month => {
                const util = getMonthUtilization(workforce?.lastThreeMonthsIndividually, month);
                rowData[month] = formatPercentage(util);
            });

            return rowData;
        })
        .filter((row): row is TableDataType => row !== null);
};

export default Example;