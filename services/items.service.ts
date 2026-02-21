import { supabase } from "@/lib/supabase";
import { NewItem, UpdateItem } from "@/models/item";

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

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  console.log("Data:", data);
  return { data, error };
}

export async function updateItem(id: string, updated_item: UpdateItem) {
  const { data, error } = await supabase
    .from('items')
    .update(updated_item)
    .eq("id", id)
    .select()
  
  return { data, error };
}

export async function deleteItem(id: string) {
  const { data, error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  console.log("Data:", data);
  return { data, error };
}