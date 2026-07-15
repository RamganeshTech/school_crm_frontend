import { type UserRole } from "../features/slices/authSlice";

export const checkPermission = (
  userRole: UserRole,
  allowedRoles: Partial<UserRole[]>
): void => {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error('Unauthorized Action: You do not have permission to perform this action.');
  }
};



export const getAcademicYears = (): any[] => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10; // Go 10 years back
  const options: any[] = [];

  // Generate 21 options to cover a 20-year span (10 past, current, 10 future)
  for (let i = 0; i <= 20; i++) {
    const year = startYear + i;
    const academicYear = `${year}-${year + 1}`;
    options.push({ label: academicYear, value: academicYear });
  }

  return options;
};


// Define the allowed format variants for strict typings
export type DateFormatVariant =
  | 'date'          // dd/mm/yyyy (default)
  | 'datetime'      // dd/mm/yyyy : hh:mm:ss
  | 'datetime-12h'  // dd/mm/yyyy : hh:mm:ss AM/PM
  | 'iso'           // yyyy-mm-dd (useful for inputs)
  | 'long'          // Month DD, YYYY (e.g., May 16, 2026)
  | 'long-datetime'
  | 'full';         // Day, Month DD, YYYY (e.g., Saturday, May 16, 2026)

export interface FormatDateOptions {
  /** The format style to output. Defaults to 'date' */
  variant?: DateFormatVariant;
  /** Fallback string if the date is invalid or missing. Defaults to 'N/A' */
  fallback?: string;
}

/**
 * Formats a given date/string/timestamp into a readable string.
 * @param inputDate - The date to format (String, Date object, or timestamp number)
 * @param options - Format options { variant, fallback }
 */
export const formatDate = (
  inputDate: Date | string | number | null | undefined,
  options: FormatDateOptions = {}
): string => {
  const { variant = 'date', fallback = 'N/A' } = options;

  if (!inputDate) return fallback;

  // Convert input to a valid JS Date object
  const date = new Date(inputDate);

  // Check if the date conversion failed
  if (isNaN(date.getTime())) {
    return fallback;
  }

  // Extract core components with padding for single digits
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  const hours24 = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 12-hour format logic
  const h = date.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hours12 = String(h % 12 || 12).padStart(2, '0');

  // Return the requested variant
  switch (variant) {
    case 'datetime':
      return `${day}/${month}/${year} : ${hours24}:${minutes}:${seconds}`;

    case 'datetime-12h':
      return `${day}/${month}/${year} : ${hours12}:${minutes}:${seconds} ${ampm}`;

    case 'iso':
      return `${year}-${month}-${day}`;

    case 'long':
      // E.g., May 16, 2026
      return new Intl.DateTimeFormat('en-IN', {
        month: 'long', day: 'numeric', year: 'numeric'
      }).format(date);

    // --- ADD THIS CASE BLOCK ---
    case 'long-datetime': {
      const longDate = new Intl.DateTimeFormat('en-IN', {
        month: 'long', day: 'numeric', year: 'numeric'
      }).format(date);
      return `${longDate} : ${hours12}:${minutes}:${seconds} ${ampm}`;
    }

    case 'full':
      // E.g., Saturday, May 16, 2026
      return new Intl.DateTimeFormat('en-IN', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }).format(date);

    case 'date':
    default:
      return `${day}/${month}/${year}`;
  }
};


export const formatTime12Hour = (time24: string) => {
    if (!time24) return '';
    const [hourString, minute] = time24.split(':');
    const hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    // Optional: add .toString().padStart(2, '0') to hour12 if you want "09:03 PM" instead of "9:03 PM"
    return `${hour12}:${minute} ${ampm}`;
};

// 1. Default (Date Only)
// formatDate("2026-05-16T11:39:55.000Z")
// Output: "16/05/2026"

// 2. Specific Datetime (24h)
// formatDate(new Date(), { variant: 'datetime' })
// Output: "16/05/2026 : 11:39:55"

// 3. Specific Datetime (12h with AM/PM)
// formatDate(1715843395000, { variant: 'datetime-12h' })
// Output: "16/05/2026 : 11:39:55 AM"

// 4. Long format for standard UI
// formatDate("2026-05-16", { variant: 'long' })
// Output: "16 May 2026"


// 5. Handling null or missing data cleanly
// formatDate(null, { fallback: 'Not Paid Yet' })
// Output: "Not Paid Yet"

// formatDate("2026-05-16T11:41:55.000Z", { variant: 'long-datetime' }) 
// Output: "16 May 2026 : 11:41:55 AM"


// Converts "2026-06-03" to "03/06/2026" safely for display
export const displayFormat = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};