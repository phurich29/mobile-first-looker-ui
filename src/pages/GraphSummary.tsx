
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileChartLine, Layout, ChartBar, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GraphSummary = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    // Get sidebar collapsed state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setIsCollapsed(savedCollapsedState === 'true');
    }
    
    // Listen for changes in localStorage
    const handleStorageChange = () => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(currentState === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Use requestAnimationFrame for smoother checks
    let rafId: number;
    const checkState = () => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      if (currentState === 'true' !== isCollapsed) {
        setIsCollapsed(currentState === 'true');
      }
      rafId = requestAnimationFrame(checkState);
    };
    
    rafId = requestAnimationFrame(checkState);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      cancelAnimationFrame(rafId);
    };
  }, [isCollapsed]);
  
  // Calculate sidebar width for layout
  const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : '';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-20' : `pb-8 ${sidebarWidth}`} p-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <FileChartLine className="h-6 w-6" />
              Graph Summary
            </h1>
            
            <div className="flex mt-4 md:mt-0">
              <Button asChild variant="outline" className="mr-2">
                <Link to="/graph-monitor" className="flex items-center gap-2">
                  <ChartBar className="h-4 w-4" />
                  View Graphs
                </Link>
              </Button>
              
              <Button asChild variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                <Link to="/graph-summary-detail" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Compare Metrics
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Graph Summary Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Summary Card 1 */}
            <Card className="p-5 bg-white border border-emerald-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 mr-3">
                  <Layout className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Active Graphs</h3>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-semibold text-emerald-700 dark:text-emerald-400">4</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Last updated today</span>
              </div>
            </Card>
            
            {/* Summary Card 2 */}
            <Card className="p-5 bg-white border border-emerald-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 mr-3">
                  <ChartBar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Data Points</h3>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400">1,240</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Across all sensors</span>
              </div>
            </Card>
            
            {/* Summary Card 3 */}
            <Card className="p-5 bg-white border border-emerald-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-sky-100 dark:bg-sky-900/40 mr-3">
                  <FileChartLine className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Saved Views</h3>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-semibold text-sky-600 dark:text-sky-400">2</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Custom dashboards</span>
              </div>
            </Card>
          </div>
          
          {/* New Feature Highlight Card */}
          <Card className="mb-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white p-6 border-none shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold mb-2">New Feature: Compare Multiple Metrics</h2>
                <p className="text-emerald-100 max-w-2xl">
                  Now you can compare multiple measurements from different devices on a single graph. 
                  Perfect for analyzing trends and correlations between different metrics.
                </p>
              </div>
              <Button asChild size="lg" variant="secondary" className="text-emerald-600 hover:text-emerald-800">
                <Link to="/graph-summary-detail">
                  Try It Now
                </Link>
              </Button>
            </div>
          </Card>
          
          {/* Recent Activity Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">Recent Activity</h2>
            <Card className="overflow-hidden border border-emerald-100 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-emerald-50 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-emerald-700 dark:text-emerald-400">Graph</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-emerald-700 dark:text-emerald-400">Type</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-emerald-700 dark:text-emerald-400">Last Updated</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-emerald-700 dark:text-emerald-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Temperature Monitor</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Line Chart</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Today, 10:23 AM</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Humidity Analysis</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Area Chart</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Yesterday, 4:45 PM</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Water Level</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Bar Chart</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">2 days ago</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Paused
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <FooterNav />
    </div>
  );
};

export default GraphSummary;
