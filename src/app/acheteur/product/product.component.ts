import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../shared/models/product';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

interface ProductWithImage extends Product {
  imageUrl: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  products: ProductWithImage[] = [
    {
      _id: '1',
      name: 'Nike Air MX Super 2500 - Red',
      price: 699,
      productTypeId: 'shoes-001',
      shop: {
        _id: 'shop-001',
        name: 'Nike Store'
      },
      stock: 50,
      promotion: {
        active: true,
        reduction: 39
      },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'
    },
    {
      _id: '2',
      name: 'Apple MacBook Pro 16" M3',
      price: 2499,
      productTypeId: 'laptop-001',
      shop: {
        _id: 'shop-002',
        name: 'Apple Premium'
      },
      stock: 25,
      promotion: {
        active: true,
        reduction: 15
      },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop'
    },
    {
      _id: '3',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      price: 399,
      productTypeId: 'audio-001',
      shop: {
        _id: 'shop-003',
        name: 'Sony Official'
      },
      stock: 100,
      promotion: {
        active: true,
        reduction: 25
      },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=600&fit=crop'
    },
    {
      _id: '4',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1299,
      productTypeId: 'phone-001',
      shop: {
        _id: 'shop-004',
        name: 'Samsung Electronics'
      },
      stock: 75,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'
    },
    {
      _id: '5',
      name: 'Canon EOS R6 Mark II Camera',
      price: 2499,
      productTypeId: 'camera-001',
      shop: {
        _id: 'shop-005',
        name: 'Canon Store'
      },
      stock: 30,
      promotion: {
        active: true,
        reduction: 20
      },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop'
    },
    {
      _id: '6',
      name: 'Adidas Ultraboost 23 Running Shoes',
      price: 189,
      productTypeId: 'shoes-002',
      shop: {
        _id: 'shop-006',
        name: 'Adidas Official'
      },
      stock: 120,
      promotion: {
        active: true,
        reduction: 30
      },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop'
    },
    {
      _id: '7',
      name: 'Dell XPS 15 Laptop',
      price: 1899,
      productTypeId: 'laptop-002',
      shop: {
        _id: 'shop-007',
        name: 'Dell Technologies'
      },
      stock: 40,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop'
    },
    {
      _id: '8',
      name: 'Apple Watch Series 9',
      price: 429,
      productTypeId: 'watch-001',
      shop: {
        _id: 'shop-002',
        name: 'Apple Premium'
      },
      stock: 80,
      promotion: {
        active: true,
        reduction: 10
      },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop'
    }
  ];
}
