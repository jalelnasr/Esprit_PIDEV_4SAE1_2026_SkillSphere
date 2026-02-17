import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  searchQuery = '';
  selectedStatus = 'all';
  
  users = [
    { id: 1, name: 'Sarah Ahmed', email: 'sarah@example.com', role: 'Student', status: 'active', joinDate: '2024-01-15', courses: 5 },
    { id: 2, name: 'Mohamed Ali', email: 'mohamed@example.com', role: 'Instructor', status: 'active', joinDate: '2024-02-10', courses: 12 },
    { id: 3, name: 'Fatima Hassan', email: 'fatima@example.com', role: 'Student', status: 'active', joinDate: '2024-03-05', courses: 3 },
    { id: 4, name: 'Ibrahim Sayed', email: 'ibrahim@example.com', role: 'Admin', status: 'active', joinDate: '2024-01-01', courses: 0 },
    { id: 5, name: 'Aisha Khalid', email: 'aisha@example.com', role: 'Student', status: 'inactive', joinDate: '2023-12-20', courses: 2 },
    { id: 6, name: 'Hassan Omar', email: 'hassan@example.com', role: 'Instructor', status: 'active', joinDate: '2024-02-15', courses: 8 },
  ];

  filteredUsers: any[] = [];

  ngOnInit() {
    this.filterUsers();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || user.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  onSearch() {
    this.filterUsers();
  }

  onStatusChange() {
    this.filterUsers();
  }

  editUser(user: any) {
    console.log('Edit user:', user);
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.filterUsers();
    }
  }

  getRoleColor(role: string): string {
    const colors: any = {
      'Admin': 'danger',
      'Instructor': 'warning',
      'Student': 'info'
    };
    return colors[role] || 'info';
  }
}
