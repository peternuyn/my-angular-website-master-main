import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';
import { DocumentData, Firestore, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { User } from '../account/register/register.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockFirestore: jest.Mocked<Firestore>;

  // Mock users
  const mockUsers: User[] = [
    { uid: '123', displayName: 'Test User', email: 'test@example.com' },
  ];

  // Mock collectionData to return our mock users
  jest.mock('@angular/fire/firestore', () => ({
    collectionData: jest.fn(() => of(mockUsers as DocumentData[])),
  }));

    
  // Mock Firestore
  mockFirestore = {
    collection: jest.fn(), 
  } as unknown as jest.Mocked<Firestore>;

  beforeEach(async () => {
    mockAuthService = {
      getCurrentUser: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
      
      

      // Mock window.location.reload
      Object.defineProperty(window, 'location', {
        value: { reload: jest.fn() },
        writable: true,
      });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, 
                HeaderComponent,
    ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Firestore, useValue: mockFirestore },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    component.ngOnInit();
    expect(component.theme).toBe('dark');
  });

  it('should toggle theme and update localStorage', () => {
    component.theme = 'light';
    component.toggleTheme();
    expect(component.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    component.toggleTheme();
    expect(component.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should emit themeChange event when theme is toggled', () => {
    const emitSpy = jest.spyOn(component.themeChange, 'emit');
    component.toggleTheme();
    expect(emitSpy).toHaveBeenCalledWith('dark');
  });

  it('should set currentUserDisplay and currentUserId if user is authenticated', () => {
    const mockUser = { displayName: 'Test User', email: 'test@example.com', uid: '12345' };
  
    mockAuthService.getCurrentUser.mockReturnValue(mockUser); // Set the return value **before** calling ngOnInit
  
    component.ngOnInit();
  
    expect(component.currentUserDisplay).toBe('Test User');
    expect(component.currentUserId).toBe('12345');
  });
  

  it('should call AuthService.logout when signOut is called', () => {
    component.signOut();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});