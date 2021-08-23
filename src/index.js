const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find((item)=>item.username===username)

  if (!user){
    return response.status(404).send({error: 'Not found'})
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const userAlrealdysExists = users.some((item)=>item.username===username)

  if (userAlrealdysExists){
    return response.status(400).send({error: 'User already created'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }
  users.push(user)

  return response.status(201).send({...user})
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user

  return response.status(200).send(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }
  request.user.todos.push(todo)

  return response.status(201).send({...todo})
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {id} = request.params
  const index = request.user.todos.findIndex(todo => todo.id === id) 

  if (index === -1){
    return response.status(404).send({error: 'Not found'})
  }

  const currentTodo = request.user.todos[index]

  request.user.todos[index] = {
    ...currentTodo,
    deadline: new Date(deadline),
    title,
  }

  return response.status(200).send(request.user.todos[index])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const index = request.user.todos.findIndex(todo => todo.id === id) 

  if (index === -1){
    return response.status(404).send({error: 'Not found'})
  }

  const currentTodo = request.user.todos[index]

  request.user.todos[index] = {
    ...currentTodo,
    done: true,
  }

  return response.status(200).send(request.user.todos[index])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const index = request.user.todos.findIndex(todo => todo.id === id) 

  if (index === -1){
    return response.status(404).send({error: 'Not found'})
  }

  request.user.todos.splice(index)

  return response.status(204).send()
});

module.exports = app;