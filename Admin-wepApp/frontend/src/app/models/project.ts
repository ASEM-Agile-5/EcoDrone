export interface Tasks {
  id: string,
  title: string,
  dueDate: string,
  status: string,
  priority: string,
}

export type Project = {
    projectId: string,
    progress: number,
    currentBalance: number,
    amountInvested: number,
    location: string,
    projectName: string,
    description: string,
    updates: string[],
    budget?: {
      operational: number,
      capital: number
    },
    status: string,
    imageUrl?: string,
    backlog?: Tasks[]
    
}
export interface ProjectResponse {
  project: Project
}
