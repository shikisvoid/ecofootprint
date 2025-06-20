// Google Translate API Integration for EcoCloudApp
class TranslationService {
  private readonly TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || 'demo_key';
  private cache = new Map<string, { translation: string; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Supported languages for eco app
  private supportedLanguages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'pt': 'Portuguese',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'hi': 'Hindi',
    'ar': 'Arabic'
  };

  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `${text}_${sourceLanguage}_${targetLanguage}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('🔄 Using cached translation');
        return cached.translation;
      }

      // Skip translation if same language
      if (sourceLanguage === targetLanguage) {
        return text;
      }

      // Check if API key is available
      if (this.TRANSLATE_API_KEY === 'demo_key') {
        console.warn('⚠️ Google Translate API key not configured');
        return text; // Return original text
      }

      console.log(`🌐 Translating from ${sourceLanguage} to ${targetLanguage}`);

      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: 'text'
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      // Cache the result
      this.cache.set(cacheKey, {
        translation: translatedText,
        timestamp: Date.now()
      });

      console.log('✅ Translation successful');
      return translatedText;

    } catch (error) {
      console.error('❌ Translation error:', error);
      return text; // Return original text on error
    }
  }

  // Translate eco suggestions
  async translateEcoSuggestion(suggestion: any, targetLanguage: string): Promise<any> {
    if (targetLanguage === 'en') return suggestion;

    try {
      const translatedResponse = await this.translateText(suggestion.response, targetLanguage);
      const translatedActionItems = await Promise.all(
        suggestion.actionItems.map((item: string) => this.translateText(item, targetLanguage))
      );

      return {
        ...suggestion,
        response: translatedResponse,
        actionItems: translatedActionItems,
        originalLanguage: 'en',
        translatedTo: targetLanguage
      };
    } catch (error) {
      console.error('❌ Error translating eco suggestion:', error);
      return suggestion;
    }
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Detect language (simple implementation)
  detectLanguage(text: string): string {
    // Simple language detection based on common words
    const languagePatterns = {
      'es': /\b(el|la|de|en|y|a|que|es|se|no|te|lo|le|da|su|por|son|con|para|una|tiene|más|este|ya|todo|esta|muy|hacer|puede|tiempo|si|él|dos|mi|sobre|también|hasta|hay|donde|quien|desde|todos|durante|sin|lugar|manera|bien|poder|decir|tanto|mientras|según|entre|vida|ejemplo|siempre|tanto|menos|días|casi|nada|otros|momento|país|cada|bajo|gobierno|nuevo|trabajo|parte|año|grupo|empresa|caso|mano|agua|hombre|mujer|niño|casa|mundo|estado|ciudad|forma|historia|información|sistema|programa|problema|servicio|política|economía|desarrollo|social|nacional|internacional|público|general|local|personal|natural|humano|cultural|tecnológico|científico|educativo|médico|legal|financiero|comercial|industrial|ambiental)\b/gi,
      'fr': /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|par|grand|en|mais|que|où|ou|et|donc|or|ni|car|mais|ou|et|donc|or|ni|car|si|comme|quand|bien|très|plus|moins|aussi|encore|déjà|toujours|jamais|souvent|parfois|quelquefois|maintenant|aujourd|hier|demain|avant|après|pendant|depuis|jusqu|vers|chez|sans|sous|sur|dans|par|pour|avec|contre|entre|parmi|selon|malgré|grâce|cause|effet|raison|but|moyen|manière|façon|temps|moment|jour|année|mois|semaine|heure|minute|seconde|lieu|endroit|place|pays|ville|région|monde|terre|ciel|mer|eau|air|feu|nature|animal|plante|homme|femme|enfant|famille|ami|travail|école|maison|voiture|argent|santé|bonheur|amour|paix|guerre|politique|économie|société|culture|art|science|technologie|médecine|éducation|sport|musique|cinéma|livre|journal|télévision|internet|ordinateur|téléphone)\b/gi,
      'de': /\b(der|die|das|und|in|den|von|zu|mit|sich|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|einer|um|am|sind|noch|wie|einem|über|einen|so|zum|war|haben|nur|oder|aber|vor|zur|bis|unter|während|des|sein|sehr|da|wenn|kann|man|mehr|nach|ohne|sondern|zwischen|beim|seit|gegen|vom|durch|sowie|bzw|usw|etc|bzw|inkl|exkl|ggf|evtl|ca|bzw|usw|etc|inkl|exkl|ggf|evtl|ca|deutschland|europa|welt|staat|land|stadt|gemeinde|region|bundesland|regierung|politik|wirtschaft|gesellschaft|kultur|bildung|wissenschaft|forschung|technologie|medizin|gesundheit|umwelt|natur|klima|energie|verkehr|transport|industrie|handel|service|dienstleistung|unternehmen|firma|betrieb|organisation|verein|partei|gewerkschaft|kirche|schule|universität|krankenhaus|polizei|feuerwehr|armee|militär|familie|eltern|kinder|freunde|nachbarn|kollegen|menschen|personen|leute|bürger|einwohner|bevölkerung|jugend|alter|leben|tod|geburt|hochzeit|arbeit|beruf|job|karriere|erfolg|geld|einkommen|ausgaben|kosten|preis|wert|qualität|quantität|größe|gewicht|länge|breite|höhe|tiefe|farbe|form|material|stoff|substanz|element|teil|stück|nummer|zahl|menge|prozent|grad|meter|kilometer|kilogramm|liter|sekunde|minute|stunde|tag|woche|monat|jahr|jahrhundert|jahrtausend)\b/gi,
      'pt': /\b(o|a|de|e|do|da|em|um|para|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|era|depois|sem|mesmo|aos|ter|seus|suas|numa|pelos|pelas|esse|esses|essa|essas|meu|minha|meus|minhas|teu|tua|teus|tuas|nosso|nossa|nossos|nossas|vosso|vossa|vossos|vossas|dele|dela|deles|delas|este|esta|estes|estas|isto|aquele|aquela|aqueles|aquelas|aquilo|todo|toda|todos|todas|outro|outra|outros|outras|muito|muita|muitos|muitas|pouco|pouca|poucos|poucas|tanto|tanta|tantos|tantas|quanto|quanta|quantos|quantas|algum|alguma|alguns|algumas|nenhum|nenhuma|nenhuns|nenhumas|cada|qualquer|quaisquer|tal|tais|que|quem|qual|quais|onde|quando|como|porque|porquê|para|por|sem|com|sobre|sob|entre|contra|durante|desde|até|através|mediante|conforme|segundo|perante|ante|após|brasil|portugal|mundo|país|estado|cidade|região|governo|política|economia|sociedade|cultura|educação|ciência|tecnologia|medicina|saúde|ambiente|natureza|clima|energia|transporte|indústria|comércio|serviço|empresa|organização|família|pessoas|vida|trabalho|dinheiro|tempo|casa|escola|hospital|igreja|polícia|bombeiros|exército|amigos|vizinhos|colegas|juventude|idade|nascimento|casamento|morte|sucesso|qualidade|quantidade|tamanho|peso|comprimento|largura|altura|profundidade|cor|forma|material|número|quantidade|porcentagem|grau|metro|quilômetro|quilograma|litro|segundo|minuto|hora|dia|semana|mês|ano|século|milênio)\b/gi,
      'zh': /[\u4e00-\u9fff]+/g,
      'ja': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]+/g,
      'ko': /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]+/g,
      'ar': /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]+/g,
      'hi': /[\u0900-\u097f]+/g
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }

  // Get user's preferred language from browser
  getUserLanguage(): string {
    const browserLang = navigator.language.split('-')[0];
    return this.supportedLanguages[browserLang as keyof typeof this.supportedLanguages] ? browserLang : 'en';
  }
}

export const translationService = new TranslationService();
