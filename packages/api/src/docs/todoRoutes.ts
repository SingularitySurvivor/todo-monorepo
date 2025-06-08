/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     description: Creates a new todo item in a specified list
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodoRequest'
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to the specified list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   get:
 *     summary: Get all todos for the current user
 *     description: Retrieves all todos belonging to the current user with optional filtering and sorting
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Filter by todo status
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *           example: "in_progress"
 *       - in: query
 *         name: priority
 *         description: Filter by todo priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: "high"
 *       - in: query
 *         name: tags
 *         description: Filter by tags (comma-separated)
 *         schema:
 *           type: string
 *           example: "work,urgent"
 *       - in: query
 *         name: search
 *         description: Search in todo name and description
 *         schema:
 *           type: string
 *           example: "project"
 *       - in: query
 *         name: sortBy
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, dueDate, priority, name]
 *           example: "dueDate"
 *       - in: query
 *         name: sortOrder
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *     responses:
 *       200:
 *         description: Todos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Todo'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                               example: 1
 *                             limit:
 *                               type: integer
 *                               example: 10
 *                             total:
 *                               type: integer
 *                               example: 25
 *                             pages:
 *                               type: integer
 *                               example: 3
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/todos/stats:
 *   get:
 *     summary: Get todo statistics for the current user
 *     description: Retrieves aggregated statistics about the user's todos
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todo statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         stats:
 *                           $ref: '#/components/schemas/TodoStats'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/todos/list/{listId}:
 *   get:
 *     summary: Get all todos for a specific list
 *     description: Retrieves all todos belonging to a specific list with optional filtering and sorting
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *       - in: query
 *         name: status
 *         description: Filter by todo status
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *           example: "in_progress"
 *       - in: query
 *         name: priority
 *         description: Filter by todo priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: "high"
 *       - in: query
 *         name: tags
 *         description: Filter by tags (comma-separated)
 *         schema:
 *           type: string
 *           example: "work,urgent"
 *       - in: query
 *         name: search
 *         description: Search in todo name and description
 *         schema:
 *           type: string
 *           example: "project"
 *       - in: query
 *         name: sortBy
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, dueDate, priority, name]
 *           example: "dueDate"
 *       - in: query
 *         name: sortOrder
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *     responses:
 *       200:
 *         description: Todos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Todo'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                               example: 1
 *                             limit:
 *                               type: integer
 *                               example: 10
 *                             total:
 *                               type: integer
 *                               example: 25
 *                             pages:
 *                               type: integer
 *                               example: 3
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to the specified list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/todos/list/{listId}/stats:
 *   get:
 *     summary: Get todo statistics for a specific list
 *     description: Retrieves aggregated statistics about todos in a specific list
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     responses:
 *       200:
 *         description: Todo statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         stats:
 *                           $ref: '#/components/schemas/TodoStats'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to the specified list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/todos/{id}:
 *   get:
 *     summary: Get a specific todo by ID
 *     description: Retrieves a specific todo item by its ID
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     responses:
 *       200:
 *         description: Todo retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to this todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   patch:
 *     summary: Update a todo
 *     description: Updates an existing todo item
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoRequest'
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to this todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   delete:
 *     summary: Delete a todo
 *     description: Deletes an existing todo item
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to this todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// This file contains only Swagger documentation for todo routes
// No executable code here - just documentation
export {};