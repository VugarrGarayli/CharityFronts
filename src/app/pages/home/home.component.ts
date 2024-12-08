import { OnInit, OnDestroy, Component } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  slides = [
    { image: '/assets/images/slider/slider-1.jpg', caption: 'Birinci Resim' },
    { image: '/assets/images/slider/slider-2.jpg', caption: 'İkinci Resim' },
    { image: '/assets/images/slider/slider-3.jpg', caption: 'Üçüncü Resim' },
  ];
  currentIndex = 0;
  intervalId: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000); // 3 saniyede bir slayt değişir
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    console.log('Current index:', this.currentIndex); // Debug için eklendi
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }
}
