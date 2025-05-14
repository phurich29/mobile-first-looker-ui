
import { supabase } from "@/integrations/supabase/client";
import { NewsItem } from "../types";

/**
 * Fetches all news items from the database
 */
export async function fetchAllNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('publish_date', { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching news: ${error.message}`);
  }
  
  return data as NewsItem[];
}

/**
 * Creates a new news item
 */
export async function createNews(newsItem: Partial<NewsItem>) {
  const { error } = await supabase
    .from('news')
    .insert({
      title: newsItem.title,
      content: newsItem.content,
      publish_date: newsItem.publish_date,
      published: newsItem.published || false,
      image_url: newsItem.image_url
    });
    
  if (error) {
    throw new Error(`Error creating news: ${error.message}`);
  }
}

/**
 * Updates an existing news item
 */
export async function updateNews(id: string, newsItem: Partial<NewsItem>) {
  const { error } = await supabase
    .from('news')
    .update({
      title: newsItem.title,
      content: newsItem.content,
      publish_date: newsItem.publish_date,
      published: newsItem.published,
      image_url: newsItem.image_url
    })
    .eq('id', id);
    
  if (error) {
    throw new Error(`Error updating news: ${error.message}`);
  }
}

/**
 * Deletes a news item by id
 */
export async function deleteNews(id: string) {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(`Error deleting news: ${error.message}`);
  }
}

/**
 * Updates the publish status of a news item
 */
export async function updatePublishStatus(id: string, published: boolean) {
  const { error } = await supabase
    .from('news')
    .update({ published })
    .eq('id', id);
    
  if (error) {
    throw new Error(`Error updating publish status: ${error.message}`);
  }
}
