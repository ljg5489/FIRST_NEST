export const ADMIN_TABLES = ['places','events','place_events','place_facilities','place_images','place_tags','event_images','courses','course_stops','course_legs','place_prices','data_sync_logs'] as const;
export function isAdminUser(user: {app_metadata?: Record<string, unknown>; email_confirmed_at?: string | null} | null) {
  return Boolean(user?.email_confirmed_at && user.app_metadata?.role === 'admin');
}
export function isAdminTable(table: unknown): table is string {
  return typeof table === 'string' && (ADMIN_TABLES as readonly string[]).includes(table);
}
const editable: Record<string, Record<string,string>> = {
  places: {name_ko:'text',name_en:'text',address:'text',address_en:'text',district_code:'text',region_code:'text',category_code:'text',latitude:'number',longitude:'number',phone:'text',website:'text',opening_hours:'text',closed_days:'text',description:'text',recommended_stay_minutes:'number',foreigner_friendly_score:'number',mobility_score:'number',data_completeness_score:'number',is_active:'boolean'},
  events: {title:'text',event_start_date:'date',event_end_date:'date',address:'text',address_detail:'text',latitude:'number',longitude:'number',phone:'text',homepage:'text',first_image_url:'text',first_image_thumbnail_url:'text',overview:'text'},
  place_events:{start_date:'date',end_date:'date',venue:'text',fee_info:'text',booking_url:'text'},
  place_facilities:{facility_type:'text',is_available:'boolean',details:'text'},
  place_images:{image_url:'text',thumbnail_url:'text',source_type:'text',is_primary:'boolean',sort_order:'number'},
  event_images:{image_url:'text',thumbnail_url:'text',image_name:'text',source:'text',is_primary:'boolean',serial_number:'number'},
  place_tags:{tag:'text'},
};
export function validAdminColumns(table: unknown, columns: unknown) {
  return typeof table==='string' && Array.isArray(columns) && columns.length>0 && columns.length<=40 && columns.every(c=>c&&typeof c.key==='string'&&Object.hasOwn(editable[table]??{},c.key)&&editable[table][c.key]===c.type);
}
export function validAdminUpdate(table: unknown,id: unknown,updates: unknown) {
  if(typeof table!=='string'||!Object.hasOwn(editable,table)||!(typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||Number.isSafeInteger(id)&&Number(id)>0)||!updates||typeof updates!=='object'||Array.isArray(updates))return false;
  const entries=Object.entries(updates);return entries.length>0&&entries.every(([key,value])=>{
    if(!Object.hasOwn(editable[table],key))return false;
    const type=editable[table][key];
    if(value===null)return true;
    if(type==='number')return typeof value==='number'&&Number.isFinite(value);
    if(type==='boolean')return typeof value==='boolean';
    if(typeof value!=='string'||value.length>20000)return false;
    return type!=='date'||/^\d{4}-\d{2}-\d{2}$/.test(value);
  });
}
