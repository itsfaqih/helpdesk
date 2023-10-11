import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import React from "react";
import { Button, IconButton } from "../base/button";
import {
  Popover,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverTrigger,
} from "../base/popover";
import { Upload, X } from "@phosphor-icons/react";
import { TabContent, TabList, TabTrigger, Tabs } from "../base/tabs";
import { Input } from "../base/input";
import { Portal } from "@ark-ui/react";

const emojiIds = Object.entries(
  (data as { emojis: Record<string, unknown>[] }).emojis
).map((emoji) => emoji[0]);

type IconPickerProps = {
  id?: string;
  value?: {
    emojiId: string;
  };
  onChange?: (value: { emojiId: string }) => void;
};

export const IconPicker = React.forwardRef<
  React.ElementRef<typeof Picker>,
  IconPickerProps
>(({ id, value, onChange }, ref) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const [selectedEmojiId, setSelectedEmojiId] = React.useState<string>(
    emojiIds[(emojiIds.length * Math.random()) << 0]
  );
  ``;
  const finalEmojiId = value?.emojiId || selectedEmojiId;

  return (
    <div>
      <Popover
        open={isPopoverOpen}
        onOpen={() => setIsPopoverOpen(true)}
        onClose={() => setIsPopoverOpen(false)}
        closeOnInteractOutside={false}
      >
        <PopoverTrigger>
          <IconButton
            id={id}
            as="div"
            variant="plain"
            icon={() => {
              if (selectedEmojiId) {
                return <em-emoji id={finalEmojiId}></em-emoji>;
              }
            }}
            label="Select Icon"
          />
        </PopoverTrigger>
        <Portal>
          <PopoverContent className="p-0">
            <Tabs>
              <div className="flex items-center justify-between px-2">
                <TabList className="flex gap-1.5">
                  <TabTrigger value="emoji">Emoji</TabTrigger>
                  <TabTrigger value="upload">Upload</TabTrigger>
                  {/* <TabIndicator /> */}
                </TabList>
                <PopoverCloseTrigger asChild>
                  <IconButton
                    label="Close"
                    icon={(props) => <X {...props} />}
                  />
                </PopoverCloseTrigger>
              </div>
              <TabContent value="emoji">
                <div className="[&_em-emoji-picker]:h-64">
                  <Picker
                    ref={ref}
                    data={data}
                    autoFocus
                    perLine={6}
                    previewPosition="none"
                    maxFrequentRows={0}
                    emojiButtonRadius="0.375rem"
                    onEmojiSelect={(emoji: { id: string }) => {
                      onChange?.({ emojiId: emoji.id });
                      setSelectedEmojiId(emoji.id);
                      setIsPopoverOpen(false);
                    }}
                  />
                </div>
              </TabContent>
              <TabContent value="upload">
                <form className="w-[15.25rem] p-2.5">
                  <Input type="file" className="w-full" />
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="plain"
                      leading={(props) => <Upload {...props} />}
                    >
                      Upload
                    </Button>
                  </div>
                </form>
              </TabContent>
            </Tabs>
          </PopoverContent>
        </Portal>
      </Popover>
    </div>
  );
});
