import axios from "axios";

const apiUrl = "http://localhost:3001";

async function fetchDatabase(operation: string, entity: string): Promise<any> {
  const endpointUrl = `${apiUrl}/testData/${entity}`;
  //? fetching the data
  try {
    const response = await axios.get(endpointUrl);

    return response.data;
  } catch (error) {
    console.error(`Getting error fetching data from ${endpointUrl} -`, error);
    throw error;
  }
}
//? declare globally
declare global {
  interface WorkerContext {
    fetchDataFromDatabase(operation: string, entity: string): Promise<any>;
  }
}

async function fetchDataFromDatabase(operation: string, entity: string): Promise<any> {
  // fetching
  const data = await fetchDatabase(operation, entity);
  return data;
}

export { fetchDataFromDatabase };
