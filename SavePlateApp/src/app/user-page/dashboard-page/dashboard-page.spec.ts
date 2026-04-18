import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DahsboardPage } from './dahsboard-page';

describe('DahsboardPage', () => {
  let component: DahsboardPage;
  let fixture: ComponentFixture<DahsboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DahsboardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DahsboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
