use async_graphql::{Context, Enum, InputObject, Object, Result};
use backend::FilterBuilder;
use sqlx::{
    FromRow, PgPool, QueryBuilder,
    types::chrono::{DateTime, Utc},
};

#[derive(FromRow)]
struct User {
    id: i32,
    name: Option<String>,
    age: Option<i32>,
    email: Option<String>,
    phone: Option<String>,
    created_at: Option<DateTime<Utc>>,
    updated_at: Option<DateTime<Utc>>,
}


#[derive(InputObject)]
#[graphql(rename_fields = "camelCase")]
struct IntFilter {
    equals: Option<i32>,
    gt: Option<i32>,
    lt: Option<i32>,
    gte: Option<i32>,
    lte: Option<i32>,
}

#[derive(InputObject)]
#[graphql(rename_fields = "camelCase")]
struct StringFilter {
    equals: Option<String>,
    contains: Option<String>,
    starts_with: Option<String>,
    ends_with: Option<String>,
}

#[derive(InputObject, FilterBuilder, Default)]
#[graphql(rename_fields = "camelCase")]
struct UserFilters {
    id: Option<IntFilter>,
    name: Option<StringFilter>,
    age: Option<IntFilter>,
    email: Option<StringFilter>,
    phone: Option<StringFilter>,
    // Free-text search handled in resolver to OR across multiple fields
    search: Option<String>,
}

#[derive(InputObject, FilterBuilder, Default)]
#[graphql(rename_fields = "camelCase")]
struct PostFilters {
    id: Option<IntFilter>,
    user_id: Option<IntFilter>,
    title: Option<StringFilter>,
    content: Option<StringFilter>,
}

#[derive(InputObject, Default)]
#[graphql(rename_fields = "camelCase")]
struct UserOrderBy {
    id: Option<OrderDirection>,
    name: Option<OrderDirection>,
}

#[derive(Enum, Copy, Clone, Eq, PartialEq)]
enum OrderDirection {
    Asc,
    Desc,
}

#[derive(FromRow)]
struct Post {
    id: i32,
    user_id: Option<i32>,
    title: Option<String>,
    content: Option<String>,
    created_at: Option<DateTime<Utc>>,
    updated_at: Option<DateTime<Utc>>,
}

// This is your resolver for the User model
#[Object(rename_fields = "camelCase")]
impl User {
    async fn id(&self) -> i32 {
        self.id
    }

    async fn name(&self) -> &Option<String> {
        &self.name
    }

    async fn age(&self) -> &Option<i32> {
        &self.age
    }

    async fn email(&self) -> &Option<String> {
        &self.email
    }

    async fn phone(&self) -> &Option<String> {
        &self.phone
    }

    async fn created_at(&self) -> &Option<DateTime<Utc>> {
        &self.created_at
    }

    async fn updated_at(&self) -> &Option<DateTime<Utc>> {
        &self.updated_at
    }

    async fn posts(&self, ctx: &Context<'_>) -> Result<Vec<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let posts = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE user_id = $1")
            .bind(self.id)
            .fetch_all(pool)
            .await?;
        Ok(posts)
    }
}
// This is your resolver for the Post model
#[Object(rename_fields = "camelCase")]
impl Post {
    async fn id(&self) -> i32 {
        self.id
    }

    async fn user_id(&self) -> &Option<i32> {
        &self.user_id
    }

    async fn title(&self) -> &Option<String> {
        &self.title
    }

    async fn content(&self) -> &Option<String> {
        &self.content
    }

    async fn created_at(&self) -> &Option<DateTime<Utc>> {
        &self.created_at
    }

    async fn updated_at(&self) -> &Option<DateTime<Utc>> {
        &self.updated_at
    }

    async fn user(&self, ctx: &Context<'_>) -> Result<Option<User>> {
        if let Some(user_id) = self.user_id {
            let pool = ctx.data::<PgPool>()?;
            let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
                .bind(user_id)
                .fetch_optional(pool)
                .await?;
            Ok(user)
        } else {
            Ok(None)
        }
    }
}

#[derive(Default)]
pub struct Query;

#[derive(Default)]
pub struct Mutation;

#[derive(InputObject)]
#[graphql(rename_fields = "camelCase")]
struct UpdateUserInput {
    id: i32,
    name: Option<String>,
    age: Option<i32>,
    email: Option<String>,
    phone: Option<String>,
}

#[derive(InputObject)]
#[graphql(rename_fields = "camelCase")]
struct CreateUserInput {
    name: String,
    age: i32,
    email: String,
    phone: Option<String>,
}

#[derive(InputObject)]
#[graphql(rename_fields = "camelCase")]
struct CreatePostInput {
    user_id: i32,
    title: String,
    content: Option<String>,
}

#[Object]
impl Query {
    async fn users(&self, ctx: &Context<'_>, filters: Option<UserFilters>, order_by: Option<UserOrderBy>) -> Result<Vec<User>> {
        let pool = ctx.data::<PgPool>()?;
        let mut qb: QueryBuilder<'_, sqlx::Postgres> = QueryBuilder::new("SELECT * FROM users");
        let filters = filters.unwrap_or_default();
        let search = filters.search.clone();
        let mut has_condition = filters.apply_to_query(&mut qb);

        if let Some(term) = search {
            let pattern = format!("%{}%", term);
            if has_condition {
                qb.push(" AND (");
            } else {
                qb.push(" WHERE (");
            }
            qb.push("name ILIKE ");
            qb.push_bind(pattern.clone());
            qb.push(" OR email ILIKE ");
            qb.push_bind(pattern.clone());
            qb.push(" OR phone ILIKE ");
            qb.push_bind(pattern);
            if let Ok(numeric) = term.parse::<i32>() {
                qb.push(" OR id = ");
                qb.push_bind(numeric);
                qb.push(" OR age = ");
                qb.push_bind(numeric);
            }
            qb.push(")");
        }

        if let Some(order) = order_by {
            let mut added = false;
            if order.id.is_some() || order.name.is_some() {
                qb.push(" ORDER BY ");
                if let Some(dir) = order.id {
                    qb.push("id ");
                    qb.push(match dir { OrderDirection::Asc => "ASC", OrderDirection::Desc => "DESC" });
                    added = true;
                }
                if let Some(dir) = order.name {
                    if added {
                        qb.push(", ");
                    }
                    qb.push("name ");
                    qb.push(match dir { OrderDirection::Asc => "ASC", OrderDirection::Desc => "DESC" });
                }
            }
        }

        let users = qb.build_query_as::<User>().fetch_all(pool).await?;
        Ok(users)
    }

    async fn posts(&self, ctx: &Context<'_>, filters: Option<PostFilters>) -> Result<Vec<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let mut qb: QueryBuilder<'_, sqlx::Postgres> = QueryBuilder::new("SELECT * FROM posts");
        let filters = filters.unwrap_or_default();
        filters.apply_to_query(&mut qb);
        let posts = qb.build_query_as::<Post>().fetch_all(pool).await?;
        Ok(posts)
    }
}

#[Object(rename_fields = "camelCase")]
impl Mutation {
    async fn create_user(&self, ctx: &Context<'_>, input: CreateUserInput) -> Result<User> {
        let pool = ctx.data::<PgPool>()?;
        let user = sqlx::query_as::<_, User>(
            "INSERT INTO users (name, age, email, phone) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(input.name)
        .bind(input.age)
        .bind(input.email)
        .bind(input.phone)
        .fetch_one(pool)
        .await?;
        Ok(user)
    }

    async fn create_post(&self, ctx: &Context<'_>, input: CreatePostInput) -> Result<Post> {
        let pool = ctx.data::<PgPool>()?;
        let post = sqlx::query_as::<_, Post>(
            "INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(input.user_id)
        .bind(input.title)
        .bind(input.content)
        .fetch_one(pool)
        .await?;
        Ok(post)
    }

    async fn update_user(&self, ctx: &Context<'_>, input: UpdateUserInput) -> Result<User> {
        let pool = ctx.data::<PgPool>()?;

        let mut qb: QueryBuilder<'_, sqlx::Postgres> = QueryBuilder::new("UPDATE users SET ");
        let mut has_updates = false;
        let mut first = true;

        if let Some(name) = input.name {
            if !first { qb.push(", "); }
            first = false;
            qb.push("name = ");
            qb.push_bind(name);
            has_updates = true;
        }
        if let Some(age) = input.age {
            if !first { qb.push(", "); }
            first = false;
            qb.push("age = ");
            qb.push_bind(age);
            has_updates = true;
        }
        if let Some(email) = input.email {
            if !first { qb.push(", "); }
            first = false;
            qb.push("email = ");
            qb.push_bind(email);
            has_updates = true;
        }
        if let Some(phone) = input.phone {
            if !first { qb.push(", "); }
            first = false;
            qb.push("phone = ");
            qb.push_bind(phone);
            has_updates = true;
        }

        // No fields to update is a client error
        if !has_updates {
            return Err(async_graphql::Error::new("No fields provided to update"));
        }

        qb.push(", updated_at = CURRENT_TIMESTAMP WHERE id = ");
        qb.push_bind(input.id);
        qb.push(" RETURNING *");

        let user = qb.build_query_as::<User>().fetch_one(pool).await?;
        Ok(user)
    }
}
