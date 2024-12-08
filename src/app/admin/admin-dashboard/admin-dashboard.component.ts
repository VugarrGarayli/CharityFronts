import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { animate, style, transition, trigger } from "@angular/animations";
import { Chart, registerables } from "chart.js";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
  animations: [
    trigger("panelAnimation", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("300ms", style({ height: "*", opacity: 1 })),
      ]),
      transition(":leave", [
        animate("300ms", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class AdminDashboardComponent {
  panels = [
    { name: "projects", displayName: "Layihələr", isOpen: false, data: null },
    { name: "blogs", displayName: "Bloqlar", isOpen: false, data: null },
    {
      name: "volunteers",
      displayName: "Könüllülər",
      isOpen: false,
      data: null,
    },
    {
      name: "helprequests",
      displayName: "Yardım ehtiyacları",
      isOpen: false,
      data: null,
    },
  ];

  years: number[] = [];
  selectedYear: number = new Date().getFullYear(); // Default cari il
  charts: { [key: string]: Chart } = {}; // Hər panel üçün chart saxlayırıq

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.fetchYears(); // Bütün illəri çək
  }

  ngAfterViewInit(): void {
    // Angular DOM-u yenilədikdən sonra chart render etməyə çalışırıq
    this.panels.forEach((panel) => {
      if (panel.isOpen && panel.data) {
        // `ChangeDetectorRef.detectChanges()` çağırılacaq, çünki Angular-ın DOM-u tam yeniləməsinə əmin oluruq
        setTimeout(() => {
          this.cdRef.detectChanges();  // DOM-u məcburi olaraq yeniləyirik
          this.renderBarChart(panel.name, panel.data.datas); // Chart-i render et
        }, 0);
      }
    });
  }
  fetchYears(): void {
    const startYear = 2000;
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year);
    }
  }

  togglePanel(panel: any): void {
    panel.isOpen = !panel.isOpen;
    if (panel.isOpen) {
      if (!panel.data) {
        this.fetchPanelData(panel.name, this.selectedYear); // Cari ilin məlumatını çək
      } else {
        setTimeout(() => {
          this.cdRef.detectChanges();  // DOM-u məcburi yenilə
          this.renderBarChart(panel.name, panel.data.datas); // Chart-i render et
        }, 0);
      }
    } else {
      this.destroyChart(panel.name); // Panel bağlandıqda chart-ı məhv et
    }
  }
  

  onYearChange(year: number, panelName: string): void {
    this.selectedYear = year;
    this.fetchPanelData(panelName, year); // Seçilmiş ilin məlumatını çək
  }

  fetchPanelData(panelName: string, year: number): void {
    const url = `http://localhost:5245/api/Report/yearlyreportbymonthof${panelName}?year=${year}`;
    this.http.get<any>(url).subscribe((response) => {
      if (response.isSuccess) {
        const panel = this.panels.find((p) => p.name === panelName);
        if (panel) {
          panel.data = response.data;
          this.renderBarChart(panelName, response.data.datas); // Chart-i yenilə
        }
      }
    });
  }

  renderBarChart(panelName: string, data: any[]): void {
    const chartId = `${panelName}Chart`;
    const ctx = (document.getElementById(chartId) as HTMLCanvasElement)?.getContext("2d");

    if (!ctx) {
      console.error("Canvas context not found for chart:", chartId);
      return;
    }

    const months = data.map((item) => item.month);
    const counts = data.map((item) => item.count);

    const maxCount = Math.max(...counts, 10); // Minimum bar uzunluğu üçün 10 təyin edilir
    const percentages = counts.map((count) => (count / maxCount) * 100);

    if (this.charts[panelName]) {
      // Mövcud chart varsa, yenilə
      this.charts[panelName].data.labels = months;
      this.charts[panelName].data.datasets[0].data = percentages;
      this.charts[panelName].update();
    } else {
      // Yeni chart yarat
      this.charts[panelName] = new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "Faizlə miqdar",
              data: percentages,
              backgroundColor: "rgba(75, 73, 172, 0.6)",
              borderColor: "#4b49ac",
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: "rgba(75, 73, 172, 0.8)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "#666",
              },
            },
            y: {
              beginAtZero: true,
              max: 100, // Faiz olaraq y oxunu 100-ə qədər məhdudlaşdırırıq
              ticks: {
                callback: (value) => `${value}%`, // Faiz göstərir
                color: "#666",
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "#333",
                font: {
                  size: 12,
                },
              },
            },
          },
        },
      });
    }
  }

  destroyChart(panelName: string): void {
    if (this.charts[panelName]) {
      this.charts[panelName].destroy(); // Chart-ı məhv et
      delete this.charts[panelName]; // Chart obyektini sil
      // Canvas-u təmizləyirik ki, chart yenidən qurula bilsin
      const chartId = `${panelName}Chart`;
      const canvas = document.getElementById(chartId) as HTMLCanvasElement;
      if (canvas) {
        canvas.width = canvas.width; // Canvas-u sıfırlayırıq
      }
    }
  }
  
}
