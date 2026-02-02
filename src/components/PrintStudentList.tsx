import { forwardRef } from 'react';
import { useLanguage, MONTHS } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface StudentListItem {
  studentName: string;
  courseName: string;
  month: number;
  year: number;
  paymentStatus: 'paid' | 'unpaid';
}

interface PrintStudentListProps {
  students: StudentListItem[];
  filterMonth?: number;
  filterYear?: number;
  filterCourse?: string;
}

export const PrintStudentList = forwardRef<HTMLDivElement, PrintStudentListProps>(
  ({ students, filterMonth, filterYear, filterCourse }, ref) => {
    const { language } = useLanguage();
    
    const getFilterDescription = () => {
      const parts: string[] = [];
      if (filterMonth) {
        parts.push(MONTHS[filterMonth - 1]?.[language] || '');
      }
      if (filterYear) {
        parts.push(filterYear.toString());
      }
      if (filterCourse) {
        parts.push(filterCourse);
      }
      return parts.length > 0 ? parts.join(' - ') : 'All Records';
    };

    return (
      <div ref={ref} className="print-content p-8 bg-white text-black">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold text-teal-600">ORO DIGITAL</h1>
          <p className="text-sm text-gray-600">Computer Training Institution</p>
          <h2 className="text-xl font-semibold mt-4">Registered Students List</h2>
          <p className="text-sm text-gray-500 mt-1">{getFilterDescription()}</p>
          <p className="text-xs text-gray-400 mt-2">
            Generated on: {format(new Date(), 'MMMM dd, yyyy HH:mm')}
          </p>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">#</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Student Name</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Course</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Month</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Year</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Payment</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2 font-medium">{student.studentName}</td>
                <td className="border border-gray-300 px-3 py-2">{student.courseName}</td>
                <td className="border border-gray-300 px-3 py-2">{MONTHS[student.month - 1]?.[language]}</td>
                <td className="border border-gray-300 px-3 py-2">{student.year}</td>
                <td className="border border-gray-300 px-3 py-2">
                  <span className={student.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {student.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <div className="flex justify-between text-sm">
            <span>Total Students: <strong>{students.length}</strong></span>
            <span>Paid: <strong className="text-green-600">{students.filter(s => s.paymentStatus === 'paid').length}</strong></span>
            <span>Unpaid: <strong className="text-red-600">{students.filter(s => s.paymentStatus === 'unpaid').length}</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>ORO DIGITAL Computer Training Institution</p>
          <p>This is a computer-generated document</p>
        </div>
      </div>
    );
  }
);

PrintStudentList.displayName = 'PrintStudentList';
