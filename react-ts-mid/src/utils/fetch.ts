/**
 * 異步呼叫api, 只可用響應體為 json 的 api
 * @param api 要呼叫的api
 * @returns json 結果
 */
export async function asyncGet(api: string):Promise<any>{
    try {
        const res: Response = await fetch(api)
        try {
            return await res.json()
        } catch (error) {
            return error
        }
    } catch (error) {
        return error
    }
}

export async function asyncPost(api: string, body: {} | FormData) {
    const res: Response = await fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    try {
        return await res.json()
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function asyncPut(api: string, body: {} | FormData) {
    const res: Response = await fetch(api, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    try {
        return await res.json()
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function asyncDelete(api: string) {
    const res: Response = await fetch(api, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    try {
        return await res.json()
    } catch (error) {
        console.error(error)
        throw error
    }
}