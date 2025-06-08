/**
 * @swagger
 * /api/todo-lists:
 *   post:
 *     summary: Create a new todo list
 *     description: Creates a new todo list for the current user
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodoListRequest'
 *     responses:
 *       201:
 *         description: Todo list created successfully
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
 *                         todoList:
 *                           $ref: '#/components/schemas/TodoList'
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   get:
 *     summary: Get all todo lists for the current user
 *     description: Retrieves all todo lists that the user has access to with optional filtering and sorting
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         description: Search in todo list name and description
 *         schema:
 *           type: string
 *           example: "work"
 *       - in: query
 *         name: sortBy
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name]
 *           example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
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
 *         description: Todo lists retrieved successfully
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
 *                         todoLists:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TodoList'
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
 *                               example: 5
 *                             pages:
 *                               type: integer
 *                               example: 1
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
 * /api/todo-lists/{id}:
 *   get:
 *     summary: Get a specific todo list by ID
 *     description: Retrieves a specific todo list by its ID
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     responses:
 *       200:
 *         description: Todo list retrieved successfully
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
 *                         todoList:
 *                           $ref: '#/components/schemas/TodoList'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to this todo list
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
 *   patch:
 *     summary: Update a todo list
 *     description: Updates an existing todo list
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoListRequest'
 *     responses:
 *       200:
 *         description: Todo list updated successfully
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
 *                         todoList:
 *                           $ref: '#/components/schemas/TodoList'
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
 *         description: Forbidden - no access to this todo list
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
 *   delete:
 *     summary: Delete a todo list
 *     description: Deletes an existing todo list
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     responses:
 *       200:
 *         description: Todo list deleted successfully
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
 *         description: Forbidden - no access to this todo list
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
 * /api/todo-lists/{id}/members:
 *   post:
 *     summary: Add a member to a todo list
 *     description: Adds a new member to the specified todo list
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMemberRequest'
 *     responses:
 *       200:
 *         description: Member added successfully
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
 *                         todoList:
 *                           $ref: '#/components/schemas/TodoList'
 *       400:
 *         description: Validation error or member already exists
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
 *         description: Forbidden - no access to this todo list or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list or user not found
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
 *     summary: Update a member's role
 *     description: Updates the role of an existing member in the todo list
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMemberRoleRequest'
 *     responses:
 *       200:
 *         description: Member role updated successfully
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
 *                         todoList:
 *                           $ref: '#/components/schemas/TodoList'
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
 *         description: Forbidden - no access to this todo list or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list or member not found
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
 * /api/todo-lists/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a todo list
 *     description: Removes an existing member from the specified todo list
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Member user ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b987654321fedcba"
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                         todoList:
 *                           $ref: '#/components/schemas/TodoList'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - no access to this todo list or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list or member not found
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
 * /api/todo-lists/{id}/leave:
 *   post:
 *     summary: Leave a todo list
 *     description: Allows the current user to leave a todo list they are a member of
 *     tags: [Todo Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo list ID
 *         schema:
 *           type: string
 *           example: "6479a2e8b123456789abcdef"
 *     responses:
 *       200:
 *         description: Successfully left the todo list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Cannot leave - user is the owner or last member
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
 *         description: Forbidden - not a member of this todo list
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
 * /api/todo-lists/{listId}/todos:
 *   get:
 *     summary: Get all todos for a specific list
 *     description: Retrieves all todos belonging to a specific list with optional filtering and sorting
 *     tags: [Todo Lists]
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
 * /api/todo-lists/{listId}/todos/stats:
 *   get:
 *     summary: Get todo statistics for a specific list
 *     description: Retrieves aggregated statistics about todos in a specific list
 *     tags: [Todo Lists]
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
 */

// This file contains only Swagger documentation for todo list routes
// No executable code here - just documentation
export {};