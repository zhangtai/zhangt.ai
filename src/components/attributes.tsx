import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tags,
  TagsContent,
  TagsInput,
  TagsTrigger,
  TagsValue,
} from '@/components/ui/shadcn-io/tags';

export function UserTags() {
  return (
    <Field>
      <FieldLabel htmlFor="small-form-role">标签</FieldLabel>
      <Tags>
        <TagsTrigger>
          <TagsValue>he/him</TagsValue>
          <TagsValue>Father</TagsValue>
          <TagsValue>Chinese</TagsValue>
          <TagsValue>Jenkins</TagsValue>
          <TagsValue>Homelab</TagsValue>
        </TagsTrigger>
        <TagsContent>
          <TagsInput placeholder="Search tag..." />
        </TagsContent>
      </Tags>
    </Field>
  );
};

export function Framework() {
  return (
    <Field>
      <FieldLabel htmlFor="small-form-framework"
      >Framework</FieldLabel
      >
      <Combobox items={["Astro"]} defaultValue={"Astro"}>
        <ComboboxInput
          id="small-form-framework"
          placeholder="Select a framework"
          required
        />
        <ComboboxContent>
          <ComboboxEmpty
          >No frameworks found.</ComboboxEmpty
          >
          <ComboboxList>
            {
              (item) => (
                <ComboboxItem
                  key={item}
                  value={item}
                >
                  {item}
                </ComboboxItem>
              )
            }
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}

export function Role() {
  return (<Field>
    <FieldLabel htmlFor="small-form-role">Role</FieldLabel>
    <Select defaultValue={"developer"}>
      <SelectTrigger id="small-form-role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="developer"
          >Developer</SelectItem
          >
        </SelectGroup>
      </SelectContent>
    </Select>
  </Field>)
}
