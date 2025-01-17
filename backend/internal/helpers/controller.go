package helpers

import "encoding/json"

func MapToStruct(input interface{}, output any) error {
	data, err := json.Marshal(input)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, output)
}
