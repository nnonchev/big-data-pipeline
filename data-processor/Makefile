export PYSPARK_PYTHON := ./venv/bin/python3
export GRPC_URL_CLIENT := localhost
export GRPC_PORT := 5001

gen-venv:
	python3 -m venv venv

build: gen-venv
	venv/bin/pip install -r requirements.txt

gen-protos: build
	mkdir -p ./data_processor/generated

	./venv/bin/python -m grpc_tools.protoc \
	--python_out=./data_processor/generated \
	--grpc_python_out=./data_processor/generated \
	--proto_path=../protos \
	../protos/*.proto

	sed -i -E 's/import .*_pb2/from data_processor.generated \0/' ./data_processor/generated/*.py

run: build gen-protos
	./venv/bin/python3 -m data_processor
