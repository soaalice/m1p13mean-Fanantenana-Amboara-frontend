export interface AdminNetSalesData {
    year: number;
    total: number;
    byPeriode: {
        [month: string]: number;
    }
}

export interface AdminDashboardData {
    boxes: {
        total: number;
        byState: {
            [state: string]: number;
        }
    },
    users: {
        total: number;
        byRole: {
            [role: string]: number;
        }
    },
    netSales: AdminNetSalesData;
}