import { pipeline, env } from '@xenova/transformers';

// Configuration to ensure it works in browser environment without trying to load local files
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton to avoid reloading the model
class SentimentPipeline {
    static task = 'sentiment-analysis';
    static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
    static instance: any = null;

    static async getInstance(progressCallback: any = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task as any, this.model, { progress_callback: progressCallback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { text } = event.data;

    try {
        const classifier = await SentimentPipeline.getInstance((data: any) => {
            // Send progress updates separately
            self.postMessage({ status: 'progress', ...data });
        });

        const output = await classifier(text);

        self.postMessage({
            status: 'complete',
            output: output,
        });
    } catch (err: any) {
        self.postMessage({
            status: 'error',
            error: err.toString()
        });
    }
});
