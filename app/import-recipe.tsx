import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { parseRecipeText, parseRecipeFromUrl, formatParsedRecipe, ParsedRecipe } from '@/lib/recipeImport';

export default function ImportRecipeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'camera'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
  const [previewText, setPreviewText] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleParseUrl = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Please enter a recipe URL');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);

      // Ensure URL has protocol
      let url = urlInput.trim();
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      const parsed = await parseRecipeFromUrl(url);
      setParsedRecipe(parsed);
      setPreviewText(formatParsedRecipe(parsed));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to parse URL:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Failed to parse recipe', 'Please check the URL and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseText = () => {
    if (!textInput.trim()) {
      Alert.alert('Please paste recipe text');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const parsed = parseRecipeText(textInput);
      setParsedRecipe(parsed);
      setPreviewText(formatParsedRecipe(parsed));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to parse text:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Failed to parse recipe', 'Please check the format and try again');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (activeTab === 'url') {
        setUrlInput(text);
      } else if (activeTab === 'text') {
        setTextInput(text);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const handleUseRecipe = () => {
    if (!parsedRecipe) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/add-recipe' as any,
      params: {
        importedRecipe: JSON.stringify(parsedRecipe),
      },
    });
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Pressable onPress={handleBack} className="mb-2">
              <Text className="text-lg text-primary font-bold">← Back</Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Import Recipe</Text>
            <Text className="text-base text-muted">
              Scan, paste a URL, or paste recipe text to auto-fill the form
            </Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2">
            {(['url', 'text'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                  setParsedRecipe(null);
                  setPreviewText('');
                }}
                className={`flex-1 py-3 rounded-lg border-2 items-center ${
                  activeTab === tab
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`font-bold text-base ${
                    activeTab === tab ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {tab === 'url' ? '🔗 URL' : '📝 Text'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* URL Tab */}
          {activeTab === 'url' && (
            <View className="gap-3">
              <View className="gap-2">
                <Text className="text-lg font-bold text-foreground">Recipe URL</Text>
                <Text className="text-sm text-muted">
                  Paste a link to a recipe (AllRecipes, Food Network, etc.)
                </Text>
              </View>

              <View className="gap-2">
                <TextInput
                  value={urlInput}
                  onChangeText={setUrlInput}
                  placeholder="https://www.allrecipes.com/recipe/..."
                  placeholderTextColor="#999"
                  editable={!isLoading}
                  className="p-3 bg-surface border border-border rounded-lg text-foreground text-base"
                />
                <Pressable
                  onPress={handlePasteFromClipboard}
                  className="px-3 py-2 bg-surface border border-border rounded-lg items-center"
                >
                  <Text className="text-primary font-bold">Paste from Clipboard</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleParseUrl}
                disabled={isLoading}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed && !isLoading ? 0.97 : 1 }] },
                  { opacity: pressed && !isLoading ? 0.8 : 1 },
                ]}
                className="p-4 bg-primary rounded-lg items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-bold text-white text-lg">Extract Recipe</Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Text Tab */}
          {activeTab === 'text' && (
            <View className="gap-3">
              <View className="gap-2">
                <Text className="text-lg font-bold text-foreground">Recipe Text</Text>
                <Text className="text-sm text-muted">
                  Paste handwritten recipe (from OCR) or recipe text
                </Text>
              </View>

              <View className="gap-2">
                <TextInput
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder="Paste recipe text here...&#10;&#10;Recipe Name&#10;&#10;Ingredients:&#10;- 600g chicken&#10;- 3 tbsp soy sauce&#10;&#10;Instructions:&#10;1. Heat oil in wok..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={8}
                  className="p-3 bg-surface border border-border rounded-lg text-foreground text-base"
                />
                <Pressable
                  onPress={handlePasteFromClipboard}
                  className="px-3 py-2 bg-surface border border-border rounded-lg items-center"
                >
                  <Text className="text-primary font-bold">Paste from Clipboard</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleParseText}
                disabled={isLoading}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed && !isLoading ? 0.97 : 1 }] },
                  { opacity: pressed && !isLoading ? 0.8 : 1 },
                ]}
                className="p-4 bg-primary rounded-lg items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-bold text-white text-lg">Parse Recipe</Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Preview */}
          {previewText && (
            <View className="gap-3 p-4 bg-surface rounded-lg border border-border">
              <Text className="text-lg font-bold text-foreground">Preview</Text>
              <Text className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {previewText}
              </Text>

              <Pressable
                onPress={handleUseRecipe}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className="mt-4 p-3 bg-primary rounded-lg items-center"
              >
                <Text className="font-bold text-white text-base">✓ Use This Recipe</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setParsedRecipe(null);
                  setPreviewText('');
                  setUrlInput('');
                  setTextInput('');
                }}
                className="p-3 bg-surface border border-border rounded-lg items-center"
              >
                <Text className="font-bold text-foreground text-base">Try Again</Text>
              </Pressable>
            </View>
          )}

          {/* Tips */}
          {!previewText && (
            <View className="gap-2 p-4 bg-surface rounded-lg border border-border">
              <Text className="text-sm font-bold text-foreground">💡 Tips:</Text>
              <Text className="text-sm text-muted leading-relaxed">
                • For URLs: Works best with AllRecipes, Food Network, Serious Eats, and similar sites
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                • For text: Include recipe name, ingredients list, and instructions
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                • Quantities are preserved (e.g., "600g chicken", "3 tbsp soy sauce")
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                • You can edit any auto-filled fields before saving
              </Text>
            </View>
          )}

          {/* Spacing */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
