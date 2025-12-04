import natural from 'natural';

export class CategorizationService {
    private static classifier: natural.BayesClassifier;

    static {
        this.classifier = new natural.BayesClassifier();
        this.trainClassifier();
    }

    private static trainClassifier() {
        // Add training data
        this.classifier.addDocument('pothole on the road', 'Roads');
        this.classifier.addDocument('street light not working', 'Electricity');
        this.classifier.addDocument('garbage not collected', 'Sanitation');
        this.classifier.addDocument('water supply interrupted', 'Water');
        this.classifier.addDocument('illegal construction', 'Urban Planning');
        this.classifier.addDocument('noise pollution from factory', 'Environment');
        this.classifier.addDocument('broken pipe leaking water', 'Water');
        this.classifier.addDocument('drainage clogged', 'Sanitation');
        this.classifier.addDocument('traffic signal broken', 'Traffic');
        this.classifier.addDocument('park maintenance needed', 'Parks');

        this.classifier.train();
    }

    static predictCategory(text: string): string {
        return this.classifier.classify(text);
    }
}
