const fs = require('fs');

const files = [
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/Branch/branch-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/Level/level-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/Report/report-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/school-admin/school-admin-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/Student/student-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/super-admin/admin-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/super-admin/school-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/super-admin/super-admin-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/Teacher/teacher-table.tsx',
  'D:/ProJect Development/bongPiseth/project (04-07-26) - Copy/system-saas/app/dashboard/users/admin-table.tsx'
];

let changed = 0;
files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Add imports if not present
  if (content.includes('@tabler/icons-react') && !content.includes('IconArrowsSort')) {
    content = content.replace(
      /import\s+\{([^}]+)\}\s+from\s+["']@tabler\/icons-react["']/,
      (match, p1) => {
        return 'import { ' + p1.trim() + ', IconArrowsSort, IconArrowUp, IconArrowDown } from "@tabler/icons-react"';
      }
    );
  }

  const replacement = `<TableHead key={header.id} className={header.column.getCanSort() ? "cursor-pointer select-none hover:bg-muted/50" : ""} onClick={header.column.getToggleSortingHandler()}>
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <IconArrowUp className="h-3.5 w-3.5 text-foreground" />,
                          desc: <IconArrowDown className="h-3.5 w-3.5 text-foreground" />,
                        }[header.column.getIsSorted() as string] ?? (header.column.getCanSort() ? <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50" /> : null)}
                      </div>
                    )}
                  </TableHead>`;

  const regex = /<TableHead key=\{header\.id\}>\s*\{header\.isPlaceholder \? null : flexRender\(header\.column\.columnDef\.header,\s*header\.getContext\(\)\)\}\s*<\/TableHead>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf-8');
    changed++;
  }
});
console.log('Changed files:', changed);
