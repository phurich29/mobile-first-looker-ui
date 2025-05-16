
import { GraphStyle } from "../../types";

export const getStyleSelectButtonClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'border-gray-200 bg-white/90 hover:bg-white dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700';
    case 'neon': 
      return 'border-cyan-600 bg-gray-800 text-cyan-300 hover:bg-gray-700';
    case 'pastel': 
      return 'border-pink-200 bg-pink-100/80 text-pink-700 hover:bg-pink-100 dark:border-pink-900 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50';
    case 'monochrome': 
      return 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700';
    case 'gradient':
      return 'border-indigo-600 bg-indigo-800/80 text-white hover:bg-indigo-700';
    default:
      return 'border-gray-200 bg-white/90 hover:bg-white dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700';
  }
};

export const getStyleMenuClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic':
      return 'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200';
    case 'neon': 
      return 'bg-gray-900 border-cyan-600 text-cyan-300';
    case 'pastel': 
      return 'bg-pink-50 border-pink-200 dark:bg-gray-800 dark:border-pink-900 dark:text-pink-300';
    case 'monochrome': 
      return 'bg-gray-900 border-gray-700 text-gray-200';
    case 'gradient': 
      return 'bg-indigo-900 border-indigo-700 text-white';
    default:
      return 'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200';
  }
};

export const getTimeframeSelectClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200';
    case 'neon': 
      return 'border-cyan-600 bg-gray-800 text-cyan-300';
    case 'pastel': 
      return 'border-pink-200 bg-pink-100/80 text-pink-700 dark:border-pink-900 dark:bg-pink-900/30 dark:text-pink-300';
    case 'monochrome': 
      return 'border-gray-700 bg-gray-800 text-gray-200';
    case 'gradient':
      return 'border-indigo-600 bg-indigo-800/80 text-white';
    default:
      return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200';
  }
};

export const getSkeletonClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'bg-purple-50 dark:bg-gray-700';
    case 'neon': 
      return 'bg-gray-800';
    case 'pastel': 
      return 'bg-pink-100 dark:bg-pink-900/30';
    case 'monochrome': 
      return 'bg-gray-800';
    case 'gradient':
      return 'bg-indigo-800';
    default:
      return 'bg-purple-50 dark:bg-gray-700';
  }
};

export const getErrorTextClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'text-gray-500 dark:text-gray-400';
    case 'neon': 
      return 'text-cyan-400';
    case 'pastel': 
      return 'text-pink-500 dark:text-pink-300';
    case 'monochrome': 
      return 'text-gray-400';
    case 'gradient':
      return 'text-indigo-200';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

export const getChartTextColor = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'dark:text-gray-200';
    case 'neon': 
      return 'text-cyan-300';
    case 'pastel': 
      return 'text-pink-700 dark:text-pink-300';
    case 'monochrome': 
      return 'text-gray-200';
    case 'gradient':
      return 'text-white';
    default:
      return 'dark:text-gray-200';
  }
};
