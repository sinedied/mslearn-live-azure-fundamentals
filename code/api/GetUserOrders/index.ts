import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { DataConnection } from "../helper/DataConnection";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try
    {
        let data = new DataConnection();
        let userid = await data.GetUserIdFromToken(context);

        if (userid == null)
        {
            context.res = {
                status: 401,
                body: "There is no user defined to retrieve orders from"
            };
            return;
        }

        let container = data.GetContainer();
        var query: any = {
            query: "select * from product p where p.itemType = 'order' and p.userAccount = @id",
            parameters: [
                {
                    name: "@id",
                    value: userid
                }
            ]
        };
        let iterator = container.items.query(query);
        let resources = await iterator.fetchAll();

        context.res = { body: resources };
    } catch (err)
    {
        context.res = {
            status: 500,
            body: err.message
          };
    }
};

export default httpTrigger;
