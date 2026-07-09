// Mock roadmap data for UI development
// This will be replaced with real API calls when backend is ready

import frontendRoadmap from './roadmap.json'

const mockRoadmaps = [
  frontendRoadmap,
  {
    "roadmap_id": "b1234567-89ab-cdef-0123-456789abcdef",
    "user_id": "73731cd8-06fe-419a-9ae9-3f12fbdd489f",
    "skill_id": "b8f84523-93a8-4eb5-ab02-22874dd0574c",
    "target_role": "Backend Developer",
    "status": "active",
    "plan": {
      "summary": "This 10-week roadmap focuses on building strong backend development skills including database design, API development, authentication, and cloud deployment strategies.",
      "total_weeks": 10,
      "weeks": [
        {
          "week": 1,
          "focus": "Introduction to backend development fundamentals and server-side programming concepts.",
          "skills": ["Node.js", "Express", "REST APIs"],
          "courses": [
            {
              "course_id": "c9745653-7560-4939-aa7b-f1be8c9c3fe5",
              "course_name": "Node.js: The Complete Guide",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/nodejs-the-complete-guide",
              "duration_hours": 42,
              "skills_taught": []
            }
          ],
          "activities": [
            "Set up Node.js development environment.",
            "Build a simple Express server.",
            "Understand middleware and routing concepts."
          ]
        },
        {
          "week": 2,
          "focus": "Database design and SQL fundamentals with PostgreSQL.",
          "skills": ["PostgreSQL", "SQL", "Database Design"],
          "courses": [
            {
              "course_id": "d8a057e1-16c1-4b20-820f-8f524622d725",
              "course_name": "PostgreSQL: From Zero to Hero",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/postgresql-from-zero-to-hero",
              "duration_hours": 28,
              "skills_taught": []
            }
          ],
          "activities": [
            "Design database schema for a simple application.",
            "Write complex SQL queries with joins.",
            "Implement database relationships and constraints."
          ]
        },
        {
          "week": 3,
          "focus": "Advanced database operations and ORM integration.",
          "skills": ["ORM", "Prisma", "Database Optimization"],
          "courses": [
            {
              "course_id": "e358b6d31-5224-47ec-bbf3-01a270f3201d",
              "course_name": "Prisma ORM Masterclass",
              "provider": "Pluralsight",
              "url": "https://www.pluralsight.com/courses/prisma-orm-masterclass",
              "duration_hours": 15,
              "skills_taught": []
            }
          ],
          "activities": [
            "Integrate Prisma ORM with Express.",
            "Implement database migrations.",
            "Optimize database queries with indexing."
          ]
        },
        {
          "week": 4,
          "focus": "Authentication and authorization implementation.",
          "skills": ["JWT", "OAuth", "Authentication"],
          "courses": [
            {
              "course_id": "f90e42046-f190-4248-a743-1409e918d2d0",
              "course_name": "Authentication & Security in Node.js",
              "provider": "TestDriven.io",
              "url": "https://testdriven.io/courses/auth-security-nodejs",
              "duration_hours": 20,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement JWT-based authentication.",
            "Add role-based access control.",
            "Secure API endpoints with middleware."
          ]
        },
        {
          "week": 5,
          "focus": "API security best practices and vulnerability prevention.",
          "skills": ["API Security", "OWASP", "Security"],
          "courses": [
            {
              "course_id": "g6dbff635-63a1-4b0f-bcd7-b5eb40f7a756",
              "course_name": "Web Security for Developers",
              "provider": "Pluralsight",
              "url": "https://www.pluralsight.com/courses/web-security-developers",
              "duration_hours": 18,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement input validation and sanitization.",
            "Protect against common OWASP vulnerabilities.",
            "Set up rate limiting and CORS policies."
          ]
        },
        {
          "week": 6,
          "focus": "Caching strategies with Redis for performance optimization.",
          "skills": ["Redis", "Caching", "Performance"],
          "courses": [
            {
              "course_id": "h90e42046-f190-4248-a743-1409e918d2d1",
              "course_name": "Redis in Depth",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/redis-in-depth",
              "duration_hours": 12,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement Redis caching layer.",
            "Cache frequently accessed data.",
            "Implement cache invalidation strategies."
          ]
        },
        {
          "week": 7,
          "focus": "Microservices architecture and service communication.",
          "skills": ["Microservices", "Docker", "Architecture"],
          "courses": [
            {
              "course_id": "i6dbff635-63a1-4b0f-bcd7-b5eb40f7a757",
              "course_name": "Microservices with Node.js",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/microservices-nodejs",
              "duration_hours": 35,
              "skills_taught": []
            }
          ],
          "activities": [
            "Design microservices architecture.",
            "Implement service-to-service communication.",
            "Containerize services with Docker."
          ]
        },
        {
          "week": 8,
          "focus": "Message queues and event-driven architecture.",
          "skills": ["RabbitMQ", "Event-Driven", "Async Processing"],
          "courses": [
            {
              "course_id": "j90e42046-f190-4248-a743-1409e918d2d2",
              "course_name": "Message Queues with RabbitMQ",
              "provider": "Pluralsight",
              "url": "https://www.pluralsight.com/courses/rabbitmq-message-queues",
              "duration_hours": 14,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement message queue with RabbitMQ.",
            "Design event-driven workflows.",
            "Handle asynchronous task processing."
          ]
        },
        {
          "week": 9,
          "focus": "Cloud deployment and CI/CD pipelines.",
          "skills": ["AWS", "CI/CD", "DevOps"],
          "courses": [
            {
              "course_id": "k6dbff635-63a1-4b0f-bcd7-b5eb40f7a758",
              "course_name": "AWS for Node.js Developers",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/aws-nodejs-developers",
              "duration_hours": 25,
              "skills_taught": []
            }
          ],
          "activities": [
            "Deploy application to AWS.",
            "Set up CI/CD pipeline with GitHub Actions.",
            "Configure monitoring and logging."
          ]
        },
        {
          "week": 10,
          "focus": "Testing strategies and quality assurance.",
          "skills": ["Testing", "Jest", "TDD"],
          "courses": [
            {
              "course_id": "l90e42046-f190-4248-a743-1409e918d2d3",
              "course_name": "Testing Node.js Applications",
              "provider": "TestDriven.io",
              "url": "https://testdriven.io/courses/testing-nodejs",
              "duration_hours": 16,
              "skills_taught": []
            }
          ],
          "activities": [
            "Write unit tests with Jest.",
            "Implement integration tests.",
            "Set up end-to-end testing."
          ]
        }
      ]
    },
    "created_at": "2026-07-08T10:30:00.000000Z"
  },
  {
    "roadmap_id": "c2345678-9abc-def0-1234-56789abcdef0",
    "user_id": "73731cd8-06fe-419a-9ae9-3f12fbdd489f",
    "skill_id": "c9f84523-93a8-4eb5-ab02-22874dd0574d",
    "target_role": "Full Stack Developer",
    "status": "completed",
    "plan": {
      "summary": "This 14-week comprehensive roadmap covers both frontend and backend development, including React, Node.js, databases, and deployment strategies to become a well-rounded full stack developer.",
      "total_weeks": 14,
      "weeks": [
        {
          "week": 1,
          "focus": "React fundamentals and component-based architecture.",
          "skills": ["React", "JavaScript", "Components"],
          "courses": [
            {
              "course_id": "m9745653-7560-4939-aa7b-f1be8c9c3fe6",
              "course_name": "React - The Complete Guide",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/react-the-complete-guide",
              "duration_hours": 48,
              "skills_taught": []
            }
          ],
          "activities": [
            "Set up React development environment.",
            "Build functional and class components.",
            "Understand React state and props."
          ]
        },
        {
          "week": 2,
          "focus": "React hooks and modern React patterns.",
          "skills": ["React Hooks", "State Management", "Context API"],
          "courses": [
            {
              "course_id": "n9745653-7560-4939-aa7b-f1be8c9c3fe7",
              "course_name": "React Hooks Masterclass",
              "provider": "Pluralsight",
              "url": "https://www.pluralsight.com/courses/react-hooks-masterclass",
              "duration_hours": 8,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement useState and useEffect hooks.",
            "Create custom hooks for reusable logic.",
            "Use Context API for global state."
          ]
        },
        {
          "week": 3,
          "focus": "React Router and single-page application navigation.",
          "skills": ["React Router", "Navigation", "SPA"],
          "courses": [
            {
              "course_id": "o9745653-7560-4939-aa7b-f1be8c9c3fe8",
              "course_name": "React Router v6",
              "provider": "TestDriven.io",
              "url": "https://testdriven.io/courses/react-router",
              "duration_hours": 6,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement client-side routing.",
            "Create nested routes and layouts.",
            "Handle route parameters and redirects."
          ]
        },
        {
          "week": 4,
          "focus": "State management with Redux Toolkit.",
          "skills": ["Redux", "Redux Toolkit", "State Management"],
          "courses": [
            {
              "course_id": "p9745653-7560-4939-aa7b-f1be8c9c3fe9",
              "course_name": "Redux Toolkit Essentials",
              "provider": "Redux Official",
              "url": "https://redux-toolkit.js.org/tutorials/essentials/part-1-overview-concepts",
              "duration_hours": 10,
              "skills_taught": []
            }
          ],
          "activities": [
            "Set up Redux Toolkit store.",
            "Create slices and actions.",
            "Implement async data fetching with RTK Query."
          ]
        },
        {
          "week": 5,
          "focus": "API integration and data fetching patterns.",
          "skills": ["API Integration", "Fetch", "Axios"],
          "courses": [
            {
              "course_id": "q8a057e1-16c1-4b20-820f-8f524622d726",
              "course_name": "Working with APIs in React",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/apis-react",
              "duration_hours": 12,
              "skills_taught": []
            }
          ],
          "activities": [
            "Fetch data from REST APIs.",
            "Handle loading and error states.",
            "Implement caching and optimistic updates."
          ]
        },
        {
          "week": 6,
          "focus": "Form handling and validation in React.",
          "skills": ["Forms", "Validation", "React Hook Form"],
          "courses": [
            {
              "course_id": "r358b6d31-5224-47ec-bbf3-01a270f3201e",
              "course_name": "React Hook Form",
              "provider": "Pluralsight",
              "url": "https://www.pluralsight.com/courses/react-hook-form",
              "duration_hours": 7,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement controlled and uncontrolled forms.",
            "Add form validation with Zod.",
            "Handle form submission and error display."
          ]
        },
        {
          "week": 7,
          "focus": "Node.js backend development fundamentals.",
          "skills": ["Node.js", "Express", "Backend"],
          "courses": [
            {
              "course_id": "s90e42046-f190-4248-a743-1409e918d2d4",
              "course_name": "Node.js API Masterclass",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/nodejs-api-masterclass",
              "duration_hours": 30,
              "skills_taught": []
            }
          ],
          "activities": [
            "Build RESTful APIs with Express.",
            "Implement middleware and error handling.",
            "Structure backend project architecture."
          ]
        },
        {
          "week": 8,
          "focus": "Database integration with MongoDB.",
          "skills": ["MongoDB", "Mongoose", "NoSQL"],
          "courses": [
            {
              "course_id": "t6dbff635-63a1-4b0f-bcd7-b5eb40f7a759",
              "course_name": "MongoDB Complete Guide",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/mongodb-complete-guide",
              "duration_hours": 22,
              "skills_taught": []
            }
          ],
          "activities": [
            "Connect Express to MongoDB.",
            "Define Mongoose schemas and models.",
            "Implement CRUD operations."
          ]
        },
        {
          "week": 9,
          "focus": "Authentication and authorization for full stack apps.",
          "skills": ["JWT", "Authentication", "Security"],
          "courses": [
            {
              "course_id": "u90e42046-f190-4248-a743-1409e918d2d5",
              "course_name": "Full Stack Authentication",
              "provider": "TestDriven.io",
              "url": "https://testdriven.io/courses/full-stack-auth",
              "duration_hours": 18,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement JWT authentication.",
            "Secure API endpoints.",
            "Handle user sessions and refresh tokens."
          ]
        },
        {
          "week": 10,
          "focus": "File upload and media handling.",
          "skills": ["File Upload", "Multer", "Cloud Storage"],
          "courses": [
            {
              "course_id": "v6dbff635-63a1-4b0f-bcd7-b5eb40f7a75a",
              "course_name": "File Upload in Node.js",
              "provider": "Pluralsight",
              "url": "https://www.pluralsight.com/courses/file-upload-nodejs",
              "duration_hours": 9,
              "skills_taught": []
            }
          ],
          "activities": [
            "Implement file upload with Multer.",
            "Integrate with cloud storage (AWS S3).",
            "Handle image processing and optimization."
          ]
        },
        {
          "week": 11,
          "focus": "Real-time features with WebSockets.",
          "skills": ["WebSockets", "Socket.io", "Real-time"],
          "courses": [
            {
              "course_id": "w90e42046-f190-4248-a743-1409e918d2d6",
              "course_name": "Real-time Apps with Socket.io",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/socketio-realtime",
              "duration_hours": 14,
              "skills_taught": []
            }
          ],
          "activities": [
            "Set up Socket.io server.",
            "Implement real-time chat functionality.",
            "Handle WebSocket events and rooms."
          ]
        },
        {
          "week": 12,
          "focus": "Testing full stack applications.",
          "skills": ["Testing", "Jest", "Cypress"],
          "courses": [
            {
              "course_id": "x6dbff635-63a1-4b0f-bcd7-b5eb40f7a75b",
              "course_name": "Testing Full Stack Apps",
              "provider": "TestDriven.io",
              "url": "https://testdriven.io/courses/testing-fullstack",
              "duration_hours": 16,
              "skills_taught": []
            }
          ],
          "activities": [
            "Write unit tests for React components.",
            "Test API endpoints with Supertest.",
            "Implement E2E tests with Cypress."
          ]
        },
        {
          "week": 13,
          "focus": "Docker containerization for full stack apps.",
          "skills": ["Docker", "Containers", "DevOps"],
          "courses": [
            {
              "course_id": "y90e42046-f190-4248-a743-1409e918d2d7",
              "course_name": "Docker for Developers",
              "provider": "Pluralsight",
              "url": "https://www.pluralsight.com/courses/docker-developers",
              "duration_hours": 11,
              "skills_taught": []
            }
          ],
          "activities": [
            "Create Dockerfiles for React and Node.js.",
            "Set up Docker Compose for local development.",
            "Optimize Docker images for production."
          ]
        },
        {
          "week": 14,
          "focus": "Deployment and CI/CD for full stack applications.",
          "skills": ["Deployment", "CI/CD", "AWS"],
          "courses": [
            {
              "course_id": "z6dbff635-63a1-4b0f-bcd7-b5eb40f7a75c",
              "course_name": "Deploy Full Stack Apps",
              "provider": "Udemy",
              "url": "https://www.udemy.com/course/deploy-fullstack",
              "duration_hours": 20,
              "skills_taught": []
            }
          ],
          "activities": [
            "Deploy React app to Vercel/Netlify.",
            "Deploy Node.js API to AWS/Heroku.",
            "Set up CI/CD pipeline with GitHub Actions."
          ]
        }
      ]
    },
    "created_at": "2026-06-15T08:45:00.000000Z"
  }
]

export default mockRoadmaps
