import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TableBasicProps {
  header: string[];
  children: React.ReactNode;
  isSetMinW?: string;
}

export default function TableBasic({ header, children, isSetMinW }: TableBasicProps) {
  const minW = isSetMinW === 'none' ? "" : 'min-w-[1102px]'
  return (
    <div className="overflow-hidden border-b border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className={minW}>
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] capitalize">
              <TableRow>
                {
                  header.map((item, index) => (
                    <TableCell
                      key={index}
                      isHeader
                      className="p-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {item}
                    </TableCell>
                  ))
                }
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {children}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
