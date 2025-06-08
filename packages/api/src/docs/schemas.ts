/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *         - email
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "6479a2e8b123456789abcdef"
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role in the system
 *           example: "user"
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *           example: "2023-06-01T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *           example: "2023-06-01T10:00:00.000Z"
 * 
 *     TodoList:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - ownerId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the todo list
 *           example: "6479a2e8b123456789abcdef"
 *         name:
 *           type: string
 *           description: Name of the todo list
 *           example: "Work Tasks"
 *         description:
 *           type: string
 *           description: Description of the todo list
 *           example: "Tasks related to work projects"
 *         ownerId:
 *           type: string
 *           description: ID of the user who owns this list
 *           example: "6479a2e8b123456789abcdef"
 *         isArchived:
 *           type: boolean
 *           description: Whether the list is archived
 *           example: false
 *         members:
 *           type: array
 *           description: List members with their roles
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Member user ID
 *                 example: "6479a2e8b123456789abcdef"
 *               role:
 *                 type: string
 *                 enum: [owner, admin, member, viewer]
 *                 description: Member's role in the list
 *                 example: "member"
 *               addedAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the member was added
 *                 example: "2023-06-01T10:00:00.000Z"
 *         tags:
 *           type: array
 *           description: Tags associated with the list
 *           items:
 *             type: string
 *           example: ["work", "urgent"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the list was created
 *           example: "2023-06-01T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the list was last updated
 *           example: "2023-06-01T10:00:00.000Z"
 * 
 *     Todo:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - listId
 *         - userId
 *         - status
 *         - priority
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the todo
 *           example: "6479a2e8b123456789abcdef"
 *         name:
 *           type: string
 *           description: Name/title of the todo
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           description: Detailed description of the todo
 *           example: "Write comprehensive documentation for the API"
 *         listId:
 *           type: string
 *           description: ID of the todo list this belongs to
 *           example: "6479a2e8b123456789abcdef"
 *         userId:
 *           type: string
 *           description: ID of the user who created this todo
 *           example: "6479a2e8b123456789abcdef"
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *           description: Current status of the todo
 *           example: "not_started"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level of the todo
 *           example: "medium"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the todo
 *           example: "2023-06-15T10:00:00.000Z"
 *         tags:
 *           type: array
 *           description: Tags associated with the todo
 *           items:
 *             type: string
 *           example: ["documentation", "urgent"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the todo was created
 *           example: "2023-06-01T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the todo was last updated
 *           example: "2023-06-01T10:00:00.000Z"
 *         listName:
 *           type: string
 *           description: Name of the list (populated for global todos view)
 *           example: "Work Tasks"
 * 
 *     CreateTodoRequest:
 *       type: object
 *       required:
 *         - name
 *         - listId
 *       properties:
 *         name:
 *           type: string
 *           description: Name/title of the todo
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           description: Detailed description of the todo
 *           example: "Write comprehensive documentation for the API"
 *         listId:
 *           type: string
 *           description: ID of the todo list this belongs to
 *           example: "6479a2e8b123456789abcdef"
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *           description: Initial status of the todo
 *           example: "not_started"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level of the todo
 *           example: "medium"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the todo
 *           example: "2023-06-15T10:00:00.000Z"
 *         tags:
 *           type: array
 *           description: Tags to associate with the todo
 *           items:
 *             type: string
 *           example: ["documentation", "urgent"]
 * 
 *     UpdateTodoRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name/title of the todo
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           description: Detailed description of the todo
 *           example: "Write comprehensive documentation for the API"
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *           description: Status of the todo
 *           example: "in_progress"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level of the todo
 *           example: "high"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the todo
 *           example: "2023-06-15T10:00:00.000Z"
 *         tags:
 *           type: array
 *           description: Tags to associate with the todo
 *           items:
 *             type: string
 *           example: ["documentation", "urgent"]
 * 
 *     CreateTodoListRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the todo list
 *           example: "Work Tasks"
 *         description:
 *           type: string
 *           description: Description of the todo list
 *           example: "Tasks related to work projects"
 *         tags:
 *           type: array
 *           description: Tags to associate with the list
 *           items:
 *             type: string
 *           example: ["work", "urgent"]
 * 
 *     UpdateTodoListRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the todo list
 *           example: "Work Tasks"
 *         description:
 *           type: string
 *           description: Description of the todo list
 *           example: "Tasks related to work projects"
 *         isArchived:
 *           type: boolean
 *           description: Whether to archive the list
 *           example: false
 *         tags:
 *           type: array
 *           description: Tags to associate with the list
 *           items:
 *             type: string
 *           example: ["work", "urgent"]
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: User's password
 *           example: "SecurePassword123!"
 * 
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: User's password (minimum 8 characters)
 *           example: "SecurePassword123!"
 * 
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         password:
 *           type: string
 *           description: New password (minimum 8 characters)
 *           example: "NewSecurePassword123!"
 * 
 *     ApiResponse:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, error]
 *           description: Response status
 *           example: "success"
 *         data:
 *           type: object
 *           description: Response data
 *         message:
 *           type: string
 *           description: Response message
 *           example: "Operation completed successfully"
 * 
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - status
 *         - message
 *       properties:
 *         status:
 *           type: string
 *           enum: [error]
 *           description: Error status
 *           example: "error"
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Validation failed"
 *         stack:
 *           type: string
 *           description: Error stack trace (development only)
 * 
 *     TodoStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of todos
 *           example: 25
 *         notStarted:
 *           type: integer
 *           description: Number of todos not started
 *           example: 10
 *         inProgress:
 *           type: integer
 *           description: Number of todos in progress
 *           example: 8
 *         completed:
 *           type: integer
 *           description: Number of completed todos
 *           example: 7
 *         byPriority:
 *           type: object
 *           properties:
 *             low:
 *               type: integer
 *               example: 5
 *             medium:
 *               type: integer
 *               example: 10
 *             high:
 *               type: integer
 *               example: 7
 *             urgent:
 *               type: integer
 *               example: 3
 * 
 *     AddMemberRequest:
 *       type: object
 *       required:
 *         - userId
 *         - role
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID to add as a member
 *           example: "6479a2e8b123456789abcdef"
 *         role:
 *           type: string
 *           enum: [admin, member, viewer]
 *           description: Role to assign to the new member
 *           example: "member"
 * 
 *     UpdateMemberRoleRequest:
 *       type: object
 *       required:
 *         - userId
 *         - role
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID of the member to update
 *           example: "6479a2e8b123456789abcdef"
 *         role:
 *           type: string
 *           enum: [admin, member, viewer]
 *           description: New role to assign to the member
 *           example: "admin"
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authenticating API requests
 */

// This file contains only Swagger schema definitions
// No executable code here - just documentation
export {};