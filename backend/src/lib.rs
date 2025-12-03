extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields, parse_macro_input};

#[proc_macro_derive(FilterBuilder)]
pub fn filter_builder_derive(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let struct_name = &input.ident;

    let fields = match &input.data {
        Data::Struct(data_struct) => match &data_struct.fields {
            Fields::Named(fields_named) => &fields_named.named,
            _ => panic!("FilterBuilder only works on structs with named fields"),
        },
        _ => panic!("FilterBuilder only works on structs"),
    };

    let field_conditions = fields.iter().map(|field| {
        let field_name = &field.ident;
        let field_name_str = field_name.as_ref().unwrap().to_string();
        let field_type = &field.ty;

        let inner_type_str = quote!(#field_type).to_string();
        
        if inner_type_str.contains("IntFilter") {
            quote! {
                if let Some(ref filter) = self.#field_name {
                    if let Some(value) = filter.equals {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" = ");
                        qb.push_bind(value);
                    }
                    if let Some(value) = filter.gt {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" > ");
                        qb.push_bind(value);
                    }
                    if let Some(value) = filter.lt {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" < ");
                        qb.push_bind(value);
                    }
                    if let Some(value) = filter.gte {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" >= ");
                        qb.push_bind(value);
                    }
                    if let Some(value) = filter.lte {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" <= ");
                        qb.push_bind(value);
                    }
                }
            }
        } else if inner_type_str.contains("StringFilter") {
            quote! {
                if let Some(ref filter) = self.#field_name {
                    if let Some(ref value) = filter.equals {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" = ");
                        qb.push_bind(value);
                    }
                    if let Some(ref value) = filter.contains {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" ILIKE ");
                        let pattern = format!("%{}%", value);
                        qb.push_bind(pattern);
                    }
                    if let Some(ref value) = filter.starts_with {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" ILIKE ");
                        let pattern = format!("{}%", value);
                        qb.push_bind(pattern);
                    }
                    if let Some(ref value) = filter.ends_with {
                        if is_first {
                            qb.push(" WHERE ");
                            is_first = false;
                        } else {
                            qb.push(" AND ");
                        }
                        qb.push(#field_name_str);
                        qb.push(" ILIKE ");
                        let pattern = format!("%{}", value);
                        qb.push_bind(pattern);
                    }
                }
            }
        } else {
            quote! {
            }
        }
    });

    let expanded = quote! {
        impl #struct_name {
            pub fn apply_to_query<'q>(&'q self, qb: &mut sqlx::QueryBuilder<'q, sqlx::Postgres>) -> bool {
                let mut is_first = true;
                #(#field_conditions)*
                !is_first
            }
        }
    };

    TokenStream::from(expanded)
}
