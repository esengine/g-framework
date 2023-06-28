import logger from "./Logger";
import {GServices} from "../Service/GServices";

export class ErrorHandler {
    /**
     * 处理未捕获的异常。
     * @param error - 错误对象。
     */
    public static handleUncaughtException(error: Error): void {
        // 这里可以记录错误，并通知相关人员
        logger.error('[g-server]: 未捕获的异常: %s', error);

        // 针对不同的错误类型进行特殊处理
        // 例如，根据错误类型或错误信息来判断这个错误是否严重到需要关闭服务器
        if (error.message.includes('mongodb')) {
            logger.error('[g-server]: 数据库错误。正在关闭服务器...');
            GServices.I().shutdown();
        } else if (error.message.includes('network')) {
            logger.error('[g-server]: 网络错误。正在尝试恢复...');
            // 试图恢复服务或者其他的处理方式
        } else {
            logger.error('[g-server]: 未知错误。继续运行...');
        }
    }

    /**
     * 处理未处理的 Promise 拒绝。
     * @param reason - 拒绝原因。
     * @param promise - 拒绝的 Promise。
     */
    public static handleUnhandledRejection(reason: {} | null | undefined, promise: Promise<any>): void {
        // 这里可以记录错误，并通知相关人员
        logger.error('[g-server]: 未处理的 Promise 拒绝: %O', reason);

        // 如果你能预期到某些特定类型的 Promise 错误，你也可以在这里添加针对性的处理代码
        if (typeof reason === 'object' && reason !== null && 'message' in reason) {
            const message = (reason as { message?: string }).message;
            if (message && message.includes('database')) {
                logger.error('[g-server]: Promise 中的数据库错误。正在关闭服务器...');
                GServices.I().shutdown();
            } else if (message && message.includes('network')) {
                logger.error('[g-server]: Promise 中的网络错误。正在尝试恢复...');
                // 试图恢复服务或者其他的处理方式
            } else {
                logger.error('[g-server]: 未知 Promise 拒绝。继续运行...');
            }
        }
    }
}
