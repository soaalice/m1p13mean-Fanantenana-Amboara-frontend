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
    netSales: {
        year: number;
        total: number;
        byPeriode: {
            [month: string]: number;
        }
    }
}