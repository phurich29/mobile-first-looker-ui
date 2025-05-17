
export * from './TabsHeader';
// We are exporting TabContent from TabsContent.tsx, so we need to be explicit
// to avoid the naming conflict with TabContent.tsx
export { TabContent } from './TabContent';
// Rename the export from TabsContent.tsx to avoid the conflict
export { TabContent as TabsComponent } from './TabsContent';
