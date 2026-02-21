import { supabase } from "@/lib/supabase";
import { Item } from "@/models/item";

export async function insertItem(item: Item) {
    return await supabase.from("items").insert(item);
}