# Task Title: Authentication System
Part Time
Backend - NodeJS
Created 01-08-2022 16:53:20



Create an authentication system, with the following features
1. Register, Login, Logout (use bcrypt to hash password)
2. Add roles for users, staff, managers, admin
3. protect the user route, staff route, manager route, and admin route with JSON web token
4. password recovery


<hr>

# Tasks Breakdown

For this task i built an online restaurant app that has four categories of users: Admin, managers, staffs and customers(users). A general user can register as a customer on this platform. Afterwards, they can view all menus available,  place an order and monitor thier order progress, they could also reset thier password incase they forget it. Other actions they can carry out are outlined further down this page.

A user can also register as a staff or a manager. Afterwards, they can perform actions specific to a staff or manager as outlined below.

The last category of users are the admin. Since the goal of this app is to enforce Authentication and authorizatiion routes are protected and users can't carry out actions they are not privileged to.

The users on this platform have different privileges based on their roles as outlined below.

## Users

1. Admin (Super)
2. Manager
3. Staffs
4. Customers (Users)

General User Roles

1. Can register as a Customer- (/api/users/customer/register) POST
2. Can register as a Staff - (/api/users/staff/register) POST
3. Can register as a Manager - (/api/users/manager/register) POST
4. Can register as a Admin - (/api/users/admin/register) POST
5 All users can sign in
6 All users can see thier info
7. All users (admin, manager, staffs and customer) can view a single Menu
8. All users can view all Menu

Admin User Roles

- Can get all Managers
- Can get a Manager
- Can update a Manager
- Can deactivate a Manager
- Can get all Users
- Can get a User
- Can update a User
- Can delete a User
- Can get all Staffs
- Can get a Staff
- Can deactivate / activate a Staff
- Can update a Staff
- Can delete a Staff
- Can create a Menu
- Can update a Menu
- Can get all Orders
- Can create an Order
- Can get a Order
- Can update a Order
- Can delete a Order


Manager User Roles

- Can get all Staffs
- Can get a Staff
- Can deactivate / activate a Staff
- Can modify a Staff
- Can get all Orders
- Can update a Order
- Can delete a Order


Staff User Roles

- Can get all Orders
- Can get all Orders
- Can get a specific Order
- Can register to take a Order
- Can view Orders they register for



Admin Model

- Name
- Email
- Password
- AdminId
- Type (default is a isAdmin)

Manager Model

- Name
- Email
- Password
- isActive
- isAdmin
- Type (default is a isManager)

Staff Model

- Name
- Email
- Password
- isActive
- isManager
- Type (default is a isStaff)

User (Customer) Model

- Name
- Email
- Password

Order Model

- Mealname
- Menutype
- MealId
- Usermail
- isActive (default is true: hasn't been delivered)
- TakenBy (The Staff who delivers it)

Menu Model

- Menu_type eg Special,Main dishes, sides
- Menu Items 


Since The Functions are a bit many i will be testing a few of them, of course you can view all endpoints in each rest files i have carefully tested and strutured them

- Logging a user in (Send a request to this endpoint - it returns a token which can be use to access protected route) (Access: Public)

```
POST http://localhost:3000/api/users/customer/register
Content-Type: application/json

{
    "email": "newuser@gmail.com",
    "password":"123456",
    "name": "Solomon"
}
```


![alt text](./img/user_register.png)

<hr/>
<br/>
<br/>

- To Reset password (Access: Public)

```
    PUT  http://localhost:3000/api/users/customer/reset-password/
Content-Type: application/json

{
    "email": "user@gmail.com",
    "password": "password"
}

```
![alt text](./img/reset_password.png)

<hr/>
<br/>
<br/>

- To View what is on the menu (Access: Public)

```
GET  http://localhost:3000/api/menus

```

![alt text](./img/menus.png)

<hr/>
<br/>
<br/>

- To Make An Order (Access: Private)

```
POST  http://localhost:3000/api/users/customer/orders/
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVXNlciI6eyJpZCI6IjYyZWYyNDNjYWFkZjgyNmE2MTg5ZmUxZiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20ifSwiaWF0IjoxNjU5ODcxODI2LCJleHAiOjE2NjAyMzE4MjZ9.hWpMuVnUpPRJKi7BwIg8xQ04AtsIYD18pYg0tpT91e4
Content-Type: application/json

{
    "mealname": "rice",
    "menu_type": "Special"
}

```

![alt text](./img/user_order.png)

<hr/>
<br/>
<br/>

## Staff

- To Take an order (Access: Private)

```
Get http://localhost:3000/api/users/staff/take-orders/62efa4d44ce9920bd25e4f0f
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFmZlVzZXIiOnsiaWQiOiI2MmVmYTlmNmU5MzNkZDRkMTE2NTkyMTUifSwiaWF0IjoxNjU5ODczNzgzLCJleHAiOjE2NjAyMzM3ODN9.VENNWzw7zcvmWU7_iz6S6RdMFHksy-xMOp5PGLa9D5k

```
![alt text](./img/staff_take_order.png)

<hr/>
<br/>
<br/>

- View Orders taken by me (Access: Private)

```
GET http://localhost:3000/api/users/staff/my-orders/
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFmZlVzZXIiOnsiaWQiOiI2MmVmYTlmNmU5MzNkZDRkMTE2NTkyMTUifSwiaWF0IjoxNjU5ODczNzgzLCJleHAiOjE2NjAyMzM3ODN9.VENNWzw7zcvmWU7_iz6S6RdMFHksy-xMOp5PGLa9D5k

```

![alt text](./img/staff_orders.png)

<hr/>
<br/>
<br/>


## Manager endpoints

- To view all staffs (Access: Private)

```
Get http://localhost:3000/api/users/manager/staffs
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5hZ2VyVXNlciI6eyJpZCI6IjYyZWYyZjY3N2I3MDM5Mjk4NTYwNWQyMyJ9LCJpYXQiOjE2NTk4NzIxNzQsImV4cCI6MTY2MDIzMjE3NH0.brU0A6HOb5BImW2yNi6twX3tVfNxhjsNxC1qEyvlE6A
```

![alt text](./img/manager_staffs.png)

<br>
<hr>
<hr>

- Update an order (Access: Private)

```
PUT http://localhost:3000/api/users/manager/orders/62efa4d44ce9920bd25e4f0f
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5hZ2VyVXNlciI6eyJpZCI6IjYyZWYyZjY3N2I3MDM5Mjk4NTYwNWQyMyJ9LCJpYXQiOjE2NTk4NzIxNzQsImV4cCI6MTY2MDIzMjE3NH0.brU0A6HOb5BImW2yNi6twX3tVfNxhjsNxC1qEyvlE6A
Content-Type: application/json

{
    "mealname":"Hot Jollof rice"
}
```

![alt text](./img/manager_update_order.png)

<hr>
<br>
<br>

## Admin

- Can Create a menu (Access: Private)

```
POST http://localhost:3000/api/menus/
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pblVzZXIiOnsiaWQiOiI2MmVmYzUyOTI2OTBjMDQ0YmMxYTI2NzUiLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSJ9LCJpYXQiOjE2NTk4ODA3NjgsImV4cCI6MTY2MDI0MDc2OH0.tKALWz86Rm1LsvHmEDQFoT0vppdZoVbwrnHWUXjvVNA
Content-Type: application/json

{
    "menu_type": "New Year",
    "menu_items": [{"name":"Turkey", "price":889},{"name":"Ofada Rice","price":17}]
}

```

![alt text](./img/admin_create_order.png)

<hr>
<br>
<br>


### Hi There :), whew you made it to the last paragraph. The above endpoints are just a few out of all the endpoints in this project, please feel free to clone this project to your local PC, tweak it and even break some stuffs, Lol. <b>NB:</b> You can view the whole list of endpoints / functionality of each user in their respective .rest file. Thanks and happy coding!