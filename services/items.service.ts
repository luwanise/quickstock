import { supabase } from "@/lib/supabase";
import { NewItem } from "@/models/item";

export async function insertItem(item: NewItem) {
    return await supabase.from("items").insert(item);
}

export async function getItems(userId: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};