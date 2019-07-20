import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { FirebaseService } from 'src/app/services/firebase.service';
import { LayoutManageService } from 'src/app/services/layout-manage.service';

import { Category } from 'src/app/models/product.model';
import swal from 'sweetalert2';
import { ProductsManageService } from 'src/app/services/products-manage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-select-filter',
  templateUrl: './select-filter.component.html',
  styleUrls: ['./select-filter.component.css']
})
export class SelectFilterComponent implements OnInit {
  @Output() setCategory: EventEmitter<any> = new EventEmitter();

  @Output() clear: EventEmitter<any> = new EventEmitter();

  public category: Array<Category>;
  public copyCategory: Array<Category>;
  public newCategory: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private productsManageService: ProductsManageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.productsManageService.categoryData.subscribe((c) => {
      this.category = c;
      if (c) {
        this.copyCategory = c.slice();
        this.filter();
      }
    });
  }

  public initForm(): void {
    this.newCategory = new FormGroup({
      name: new FormControl('', Validators.required)
    });
  }

  public filter(): void {
    const { name } = this.newCategory.value;
    this.copyCategory = this.category.filter(c => {
      return c.name.toLowerCase().includes(name.toLowerCase());
    });
  }

  public select(name: string, id: number): void {
    this.setCategory.emit([name, id]);
  }

  public submit(): void {
    if (!this.newCategory.valid) {
      swal.fire('Dodanie Kategorii', 'Pole nie może być puste', 'error');
      return;
    }
    const cat = this.category;
    this.category.push({
      name: this.newCategory.value.name,
      id: cat.length > 0 ? cat[cat.length - 1].id + 1 : 1
    });
    this.firebaseService.getDataBaseRef('category').set(cat)
      .then(() => {
        swal.fire('Dodanie kategorii', 'Kategoria została dodana', 'success');
        const { name, id } = this.category[this.category.length - 1];
        this.setCategory.emit([name, id]);
        this.initForm();
      });
  }

  public deleteCategory(name: string, id: number): void {
    const products = this.productsManageService.productsData.getValue();
    if (products.some(p => p.categoryID === id)) {
      swal.fire('Usunięcie Kategorii', 'Kategoria nie może być usunięta ponieważ jest przypisana do produktu', 'error');
      return;
    } else {
      this.clear.emit([name, id]);
      const cat = this.category.filter(c => c.id !== id);
      this.firebaseService.getDataBaseRef('category').set(cat);
    }

  }
}
