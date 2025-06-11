// API helper utilities

import { TodoQueryParams, ListQueryParams } from '../types/index.js';

/**
 * Flatten TodoQueryParams for API calls
 */
export const flattenTodoParams = (params?: TodoQueryParams): any => {
  if (!params) return {};
  
  const { filters, ...otherParams } = params;
  
  // Flatten the filters object to match backend expectations
  const flatParams = {
    ...otherParams,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.priority && { priority: filters.priority }),
    ...(filters?.dueDateFrom && { dueDateFrom: filters.dueDateFrom }),
    ...(filters?.dueDateTo && { dueDateTo: filters.dueDateTo }),
    ...(filters?.tags && { tags: filters.tags }),
  };
  
  return flatParams;
};

/**
 * Flatten ListQueryParams for API calls
 */
export const flattenListParams = (params?: ListQueryParams): any => {
  if (!params) return {};
  
  const { filter, sort, ...otherParams } = params;
  
  // Flatten the filter and sort objects
  const flatParams = {
    ...otherParams,
    ...(filter?.role && { role: filter.role }),
    ...(filter?.archived !== undefined && { archived: filter.archived }),
    ...(sort?.field && { sortField: sort.field }),
    ...(sort?.order && { sortOrder: sort.order }),
  };
  
  return flatParams;
};

/**
 * Format date for API calls
 */
export const formatDateForApi = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

/**
 * Parse API date response
 */
export const parseApiDate = (dateString: string): Date => {
  return new Date(dateString);
};