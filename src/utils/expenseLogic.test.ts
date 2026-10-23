import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  getCurrencySymbol,
  calculateTodayTotal,
  calculateMonthTotal,
  calculateBudgetMetrics,
  calculateCategoryBreakdown,
  filterExpenses,
  generateCSV,
} from './expenseLogic';
import { Expense } from '../types/expense';

test('currency formatting works for INR and USD', () => {
  assert.equal(getCurrencySymbol('INR'), '₹');
  assert.equal(getCurrencySymbol('USD'), '$');
  assert.equal(formatCurrency(250, 'INR'), '₹250');
  assert.equal(formatCurrency(15000, 'INR'), '₹15,000');
  assert.equal(formatCurrency(1200, 'USD'), '$1,200');
});

test('calculateTodayTotal sums only expenses from today', () => {
  const refDate = new Date(2026, 9, 23, 14, 0, 0); // Oct 23, 2026 2pm
  const startOfDay = new Date(2026, 9, 23, 0, 0, 0).getTime();
  const yesterday = new Date(2026, 9, 22, 18, 0, 0).getTime();

  const sampleExpenses: Expense[] = [
    { id: '1', amount: 150, category: 'coffee', timestamp: startOfDay + 1000 * 3600 * 9, currency: 'INR' },
    { id: '2', amount: 350, category: 'food', timestamp: startOfDay + 1000 * 3600 * 12, currency: 'INR' },
    { id: '3', amount: 500, category: 'travel', timestamp: yesterday, currency: 'INR' },
  ];

  const total = calculateTodayTotal(sampleExpenses, refDate);
  assert.equal(total, 500); // 150 + 350
});

test('calculateMonthTotal sums only expenses from current month', () => {
  const refDate = new Date(2026, 9, 23, 14, 0, 0); // Oct 2026
  const thisMonth1 = new Date(2026, 9, 5).getTime();
  const thisMonth2 = new Date(2026, 9, 20).getTime();
  const lastMonth = new Date(2026, 8, 28).getTime(); // Sep 2026

  const sampleExpenses: Expense[] = [
    { id: '1', amount: 1000, category: 'shopping', timestamp: thisMonth1, currency: 'INR' },
    { id: '2', amount: 2000, category: 'bills', timestamp: thisMonth2, currency: 'INR' },
    { id: '3', amount: 4000, category: 'health', timestamp: lastMonth, currency: 'INR' },
  ];

  const total = calculateMonthTotal(sampleExpenses, refDate);
  assert.equal(total, 3000);
});

test('calculateBudgetMetrics computes remaining, percent used, and savings', () => {
  const metrics = calculateBudgetMetrics(15000, 50000);
  assert.equal(metrics.remaining, 35000);
  assert.equal(metrics.percentUsed, 30);
  assert.equal(metrics.percentSaved, 70);
  assert.equal(metrics.isOver, false);

  const overMetrics = calculateBudgetMetrics(55000, 50000);
  assert.equal(overMetrics.remaining, 0);
  assert.equal(overMetrics.isOver, true);
});

test('calculateCategoryBreakdown groups by category sorted descending', () => {
  const sampleExpenses: Expense[] = [
    { id: '1', amount: 200, category: 'coffee', timestamp: Date.now(), currency: 'INR' },
    { id: '2', amount: 300, category: 'coffee', timestamp: Date.now(), currency: 'INR' },
    { id: '3', amount: 1000, category: 'food', timestamp: Date.now(), currency: 'INR' },
  ];

  const breakdown = calculateCategoryBreakdown(sampleExpenses);
  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].category, 'food');
  assert.equal(breakdown[0].total, 1000);
  assert.equal(breakdown[0].percentage, 67); // 1000 / 1500 = 66.6% -> 67%
  assert.equal(breakdown[1].category, 'coffee');
  assert.equal(breakdown[1].total, 500);
  assert.equal(breakdown[1].percentage, 33);
});

test('filterExpenses filters by category and search term correctly', () => {
  const now = Date.now();
  const sampleExpenses: Expense[] = [
    { id: '1', amount: 250, category: 'coffee', timestamp: now, currency: 'INR', note: 'Single Origin' },
    { id: '2', amount: 1200, category: 'shopping', timestamp: now, currency: 'INR', note: 'Black Turtleneck' },
  ];

  const coffeeFiltered = filterExpenses(sampleExpenses, '', 'coffee', 'all');
  assert.equal(coffeeFiltered.length, 1);
  assert.equal(coffeeFiltered[0].category, 'coffee');

  const noteFiltered = filterExpenses(sampleExpenses, 'turtleneck', 'all', 'all');
  assert.equal(noteFiltered.length, 1);
  assert.equal(noteFiltered[0].id, '2');
});

test('generateCSV generates valid header and lines', () => {
  const sampleExpenses: Expense[] = [
    { id: 'noir-1', amount: 100, category: 'coffee', timestamp: 1729670000000, currency: 'INR', note: 'Espresso' },
  ];

  const csv = generateCSV(sampleExpenses);
  assert.match(csv, /^ID,Date,Time,Category,Amount,Currency,Note/);
  assert.match(csv, /noir-1/);
  assert.match(csv, /Espresso/);
});
