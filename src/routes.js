import { Database } from './database.js'
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', {
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'Title is required!' }))
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'Description is required!' }))
      }

      const task = {
        id: randomUUID(), // UUID => Unique Universal ID
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (!title && !description) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ message: 'Title or description are required!' })
          )
      }

      const [tasksData] = database.select('tasks', {
        id
      })

      if (!tasksData) {
        return res.writeHead(404).end()
      }

      // const { created_at, completed_at } = tasksData[0]

      database.update('tasks', id, {
        title: title ?? tasksData.title,
        description: description ?? tasksData.description,
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const tasksData = database.select('tasks', { id })
      const { title, description, created_at } = tasksData[0]

      database.update('tasks', id, {
        title,
        description,
        completed_at: new Date(),
        created_at,
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  }
]
