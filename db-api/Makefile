export DB_URL := 
export DB_NAME := data
export GRPC_URL := [::]
export GRPC_PORT := 5001

tester:
	./venv/bin/python -m db_api.tester

gen-venv:
	python3 -m venv venv

build: gen-venv
	venv/bin/pip install -r requirements.txt

gen-protos: build
	mkdir -p ./db_api/generated

	./venv/bin/python -m grpc_tools.protoc \
	--python_out=./db_api/generated \
	--grpc_python_out=./db_api/generated \
	--proto_path=../protos \
	../protos/*.proto

	sed -i -E 's/import .*_pb2/from db_api.generated \0/' ./db_api/generated/*.py

run: build gen-protos
	./venv/bin/python -m db_api
