export interface BarrioRankingDTO {
    Nombre: string;
    Cantidad: number;
    Porcentaje: number;
}

export interface DashboardDTO {
    TotalBarrios: number;
    TotalAdjudicaciones: number;
    TotalPlanes: number;
    TotalPersonas: number;
    MontoTotalDeudaActiva?: number; 
    TopBarrios: BarrioRankingDTO[];
}