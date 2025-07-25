/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/api/project/': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List available projects */
    get: operations['backend_project_api_list_projects']
    put?: never
    /** Create a new project */
    post: operations['backend_project_api_create_project']
    /** Remove multiple projects */
    delete: operations['backend_project_api_delete_projects']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/project/researchers': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List available researchers */
    get: operations['backend_project_api_list_researchers']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/project/organisations': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List available organisations */
    get: operations['backend_project_api_list_organisations']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/project/{project_id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Get project by PK */
    get: operations['backend_project_api_get_project']
    put?: never
    post?: never
    /** Remove a project */
    delete: operations['backend_project_api_delete_project']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/project/{project_id}/activity': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** List all activities associated with a project */
    get: operations['backend_project_api_list_activities']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/project/{project_id}/offload': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Perform data offloading */
    post: operations['backend_project_api_offload_data']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/project/activity/{activity_id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Restart FAILED/QUEUED job */
    post: operations['backend_project_api_restart_activity']
    /** Remove an activity log */
    delete: operations['backend_project_api_cancel_activity']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/urls/': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Get Children Url */
    get: operations['backend_url_api_get_children_url']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
export type webhooks = Record<string, never>
export interface components {
  schemas: {
    /** ProjectGetSchema */
    ProjectGetSchema: {
      /** Id */
      id: number
      /** Name */
      name: string
      /** Location */
      location: string
      /** Is Valid */
      is_valid: boolean
      /**
       * Updated
       * Format: date-time
       */
      updated: string
      /** Year */
      year: number
      /** Internal */
      internal: boolean
      /** Researchername */
      researcherName: string | null
      /** Organisationname */
      organisationName: string | null
    }
    /** ProjectCreateSchema */
    ProjectCreateSchema: {
      /** Year */
      year: number
      /** Summary */
      summary: string
      /** Root */
      root?: string | null
      /**
       * Internal
       * @default true
       */
      internal: boolean
      /** Researcher */
      researcher?: string | null
      /** Organisation */
      organisation?: string | null
    }
    /** ResearcherSchema */
    ResearcherSchema: {
      /** Name */
      name: string
    }
    /** OrganisationSchema */
    OrganisationSchema: {
      /** Name */
      name: string
    }
    /** ActivitySchema */
    ActivitySchema: {
      /** Id */
      id: number
      /** Activity */
      activity: string
      /** Filename */
      filename: string
      /** Target */
      target: string | null
      /** Status */
      status: string
      /** Error Log */
      error_log: string | null
    }
    /** OffloadActivityForm */
    OffloadActivityForm: {
      /** Src Files */
      src_files: string[]
    }
    /** DirFileItem */
    DirFileItem: {
      /** Id */
      id: string
      /** Name */
      name: string
      /** Isdir */
      isDir: boolean
      /** Ishidden */
      isHidden: boolean
      /** Size */
      size: number
      /**
       * Moddate
       * Format: date-time
       */
      modDate: string
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}
export type $defs = Record<string, never>
export interface operations {
  backend_project_api_list_projects: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ProjectGetSchema'][]
        }
      }
    }
  }
  backend_project_api_create_project: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ProjectCreateSchema']
      }
    }
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ProjectGetSchema']
        }
      }
    }
  }
  backend_project_api_delete_projects: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': number[]
      }
    }
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  backend_project_api_list_researchers: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ResearcherSchema'][]
        }
      }
    }
  }
  backend_project_api_list_organisations: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['OrganisationSchema'][]
        }
      }
    }
  }
  backend_project_api_get_project: {
    parameters: {
      query?: never
      header?: never
      path: {
        project_id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ProjectGetSchema']
        }
      }
    }
  }
  backend_project_api_delete_project: {
    parameters: {
      query?: never
      header?: never
      path: {
        project_id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  backend_project_api_list_activities: {
    parameters: {
      query?: never
      header?: never
      path: {
        project_id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ActivitySchema'][]
        }
      }
    }
  }
  backend_project_api_offload_data: {
    parameters: {
      query?: never
      header?: never
      path: {
        project_id: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/x-www-form-urlencoded': {
          /** Src Files */
          src_files: string[]
        }
      }
    }
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  backend_project_api_restart_activity: {
    parameters: {
      query?: never
      header?: never
      path: {
        activity_id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  backend_project_api_cancel_activity: {
    parameters: {
      query?: never
      header?: never
      path: {
        activity_id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  backend_url_api_get_children_url: {
    parameters: {
      query?: {
        src?: string
        dirOnly?: boolean
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['DirFileItem'][]
        }
      }
    }
  }
}
